import type {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import type { RootState } from "@/store";
import { setTokens, signOut } from "@/modules/auth/auth.slice";

type CustomError = FetchBaseQueryError & { originalStatus?: number };

export const createBaseQuery = (
  basePath: string = ""
): BaseQueryFn<FetchArgs | string, unknown, FetchBaseQueryError> => {
  const baseQueryInstance = fetchBaseQuery({
    baseUrl:
      (import.meta as unknown as { env?: { VITE_BACKEND_URL?: string } }).env
        ?.VITE_BACKEND_URL || "",
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state?.auth?.accessToken;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
    timeout: 60000,
  });

  return async (
    args: FetchArgs | string,
    api: BaseQueryApi,
    extraOptions: Record<string, unknown>
  ) => {
    const adjustedArgs =
      typeof args === "string"
        ? { url: `${basePath}${args}` }
        : { ...args, url: `${basePath}${args.url}` };

    const result = await baseQueryInstance(adjustedArgs, api, extraOptions);

    return result;
  };
};

export const baseQuery = createBaseQuery();

export const baseQueryWithReauth = (
  basePath: string = ""
): BaseQueryFn<FetchArgs | string, unknown, FetchBaseQueryError> => {
  const baseQueryInstance = createBaseQuery(basePath);
  let isRefreshing = false;
  let refreshPromise: null | Promise<unknown> = null;

  return async (args, api, extraOptions) => {
    let result = await baseQueryInstance(args, api, extraOptions);

    // RTK Query may return string codes such as "PARSING_ERROR" in `error.status`.
    // We only care about *numeric* HTTP status codes. If `error.status` is not a
    // number, fall back to `originalStatus` which holds the raw HTTP status.
    const rawStatus = (result.error as FetchBaseQueryError | undefined)?.status;
    const status =
      (typeof rawStatus === "number" ? (rawStatus as number) : undefined) ??
      (result.error as CustomError | undefined)?.originalStatus;

    if (status === 401) {
      const state = api.getState() as RootState;
      const refreshToken = state?.auth?.refreshToken;
      if (!refreshToken) {
        api.dispatch(signOut());
        return result;
      }

      if (isRefreshing && refreshPromise) {
        try {
          await refreshPromise;
          return await baseQueryInstance(args, api, extraOptions);
        } catch {
          api.dispatch(signOut());
          return result;
        }
      }

      isRefreshing = true;
      refreshPromise = (async () => {
        const refreshBase = createBaseQuery("");
        const refreshRes = await refreshBase(
          {
            url: "/auth/refresh",
            method: "POST",
            body: { refreshToken },
            headers: { "Content-Type": "application/json" },
          },
          api,
          extraOptions
        );

        if (refreshRes.data && !(refreshRes as { error?: unknown }).error) {
          const data = (refreshRes.data as { data?: unknown })?.data as {
            accessToken?: string;
            refreshToken?: string;
          };
          if (data?.accessToken) {
            api.dispatch(
              setTokens({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken || refreshToken,
              })
            );
          } else {
            api.dispatch(signOut());
          }
        } else {
          api.dispatch(signOut());
        }
      })();

      try {
        await refreshPromise;
        result = await baseQueryInstance(args, api, extraOptions);
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    }

    return result;
  };
};

// Minimal helper for non-RTK usage that mirrors the earlier apiFetch signature
export async function apiFetch(
  input: RequestInfo | URL,
  options?: {
    accessToken?: string | null;
    refreshToken?: string | null;
    onTokensUpdated?: (accessToken: string, refreshToken: string) => void;
    onSignOut?: () => void;
    headers?: HeadersInit;
    method?: string;
    body?: BodyInit | null;
  }
) {
  const headers = new Headers(options?.headers || undefined);
  if (options?.accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }
  const res = await fetch(input, { ...options, headers });
  if (res.status !== 401 || !options?.refreshToken) return res;

  try {
    const apiBase =
      (import.meta as unknown as { env?: { VITE_BACKEND_URL?: string } }).env
        ?.VITE_BACKEND_URL || "";
    const refreshRes = await fetch(`${apiBase}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: options.refreshToken }),
    });
    if (!refreshRes.ok) throw new Error("refresh failed");
    const text = await refreshRes.text();
    const json = text ? JSON.parse(text) : {};
    const data = (json?.data ?? json) as {
      accessToken?: string;
      refreshToken?: string;
    };
    if (!data?.accessToken) throw new Error("missing access token");
    const newAccess = data.accessToken as string;
    const newRefresh = (data.refreshToken || options.refreshToken) as string;
    options?.onTokensUpdated?.(newAccess, newRefresh);

    const retryHeaders = new Headers(options?.headers || undefined);
    retryHeaders.set("Authorization", `Bearer ${newAccess}`);
    return fetch(input, { ...options, headers: retryHeaders });
  } catch {
    options?.onSignOut?.();
    return res;
  }
}
