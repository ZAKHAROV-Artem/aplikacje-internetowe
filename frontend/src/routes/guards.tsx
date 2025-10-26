import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useGetMeQuery } from "@/modules/customers/customers.api";

export function RequireAuth() {
  const accessToken = useSelector((s: RootState) => s.auth.accessToken);
  const loginTo = useSelector((s: RootState) => s.auth.loginTo);
  const { isFetching, isUninitialized, error } = useGetMeQuery(undefined, {
    skip: !accessToken,
  });
  if (!accessToken) {
    return <Navigate to={loginTo ? "/auth/code" : "/auth/phone"} replace />;
  }
  if (isUninitialized || isFetching) return null;
  const rawStatus = (error as { status?: number | string } | undefined)?.status;
  const status =
    typeof rawStatus === "number"
      ? (rawStatus as number)
      : typeof rawStatus === "string"
      ? parseInt(rawStatus, 10)
      : undefined;
  if (status === 401) return <Navigate to="/auth/phone" replace />;
  // Handle server errors (5xx) to prevent infinite refetching
  if (status && status >= 500) {
    return <Navigate to="/service-down" replace />;
  }
  return <Outlet />;
}

export function RequireOnboarding() {
  const accessToken = useSelector((s: RootState) => s.auth.accessToken);
  const {
    data: meResponse,
    isFetching,
    isUninitialized,
    error,
  } = useGetMeQuery(undefined, {
    skip: !accessToken,
  });
  const me = meResponse?.data;
  if (!accessToken) return <Navigate to="/auth/phone" replace />;
  if (isUninitialized || isFetching) return null;
  const rawStatus = (error as { status?: number | string } | undefined)?.status;
  const status =
    typeof rawStatus === "number"
      ? (rawStatus as number)
      : typeof rawStatus === "string"
      ? parseInt(rawStatus, 10)
      : undefined;
  if (status === 401) return <Navigate to="/auth/phone" replace />;
  if (status === 404) return <Navigate to="/onboarding" replace />;
  // Handle server errors (5xx) to prevent infinite refetching
  if (status && status >= 500) {
    return <Navigate to="/service-down" replace />;
  }
  if (!me && status === undefined) return null;
  const isOnboarded = Boolean(me?.metadata?.isOnboarded);
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}
