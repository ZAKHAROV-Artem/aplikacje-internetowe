// Unified fetch helper with shared http fail/success interoperability
import { failPresets, presets } from "../lib/http";
import { Response } from "express";

/**
 * File Changes:
 * - Added `fetchJSON` generic helper to wrap native fetch and convert non-2xx
 *   responses into our existing HttpException subclasses.
 * - Added timeout support and better error handling for SMRT Bridge API calls
 *
 * Usage:
 * ```ts
 * const data = await fetchJSON<MyType>("https://service/api", { method: "GET" });
 * ```
 * Any non-successful HTTP status will throw one of the domain HttpExceptions so
 * that the global error middleware can format the response for the client.
 */
async function fetchJSON<T = any>(
  url: string | URL,
  options?: RequestInit & { timeout?: number }
): Promise<T> {
  const { timeout = 60000, ...fetchOptions } = options || {};

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url.toString(), {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Attempt to parse JSON regardless of status; fall back to empty object
    const body = await response.json().catch(() => ({}));

    if (response.ok) {
      return body as T;
    }

    // Map non-2xx to our standardized FetchHttpError
    const preset = mapStatusToPreset(response.status);
    throw new FetchHttpError(
      response.status,
      preset.code,
      (body as any).message || preset.message || response.statusText,
      body
    );
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout/abort errors
    if (error instanceof Error && error.name === "AbortError") {
      const preset = presets.serviceUnavailable;
      throw new FetchHttpError(
        preset.statusCode,
        preset.code,
        "Request timeout - service is not responding",
        { timeout: true }
      );
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Authenticated fetch helper that includes an Authorization header.
 *
 * Usage:
 * ```ts
 * const data = await fetchJSONWithAuth<MyType>("https://service/api", authToken, { method: "GET" });
 * ```
 */
async function fetchJSONWithAuth<T = any>(
  url: string | URL,
  authToken: string,
  options?: RequestInit & { timeout?: number }
): Promise<T> {
  const headers = {
    ...options?.headers,
    Authorization: authToken.startsWith("Bearer ")
      ? authToken
      : `Bearer ${authToken}`,
  };
  return fetchJSON(url, {
    ...options,
    headers,
  });
}

// Lightweight error type carrying status/code/message/details to be translated by controllers
class FetchHttpError extends Error {
  status: number;
  code: string;
  details: any;

  constructor(status: number, code: string, message: string, details: any) {
    super(message);
    this.name = "FetchHttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function mapStatusToPreset(status: number) {
  switch (status) {
    case 400:
      return presets.badRequest;
    case 401:
      return presets.unauthorized;
    case 403:
      return presets.forbidden;
    case 404:
      return presets.notFound;
    case 409:
      return presets.conflict;
    case 422:
      return presets.validationError;
    case 503:
      return presets.serviceUnavailable;
    default:
      return presets.internal;
  }
}

// Express responder helper to convert FetchHttpError into our standardized JSON error via fail helpers
function respondFromFetchError(res: Response, error: any) {
  if (error && error.name === "FetchHttpError") {
    const e = error;
    switch (e.status) {
      case 400:
        return failPresets.badRequest(res, e.details, e.message);
      case 401:
        return failPresets.unauthorized(res, e.details, e.message);
      case 403:
        return failPresets.forbidden(res, e.details, e.message);
      case 404:
        return failPresets.notFound(res, e.details, e.message);
      case 409:
        return failPresets.conflict(res, e.details, e.message);
      case 422:
        return failPresets.validationError(res, e.details, e.message);
      case 503:
        return failPresets.serviceUnavailable(res, e.details, e.message);
      default:
        return failPresets.internal(res, e.details, e.message);
    }
  }
  return failPresets.internal(
    res,
    {
      message: error?.message || "Unknown error",
    },
    undefined
  );
}

export { fetchJSON, fetchJSONWithAuth, FetchHttpError, respondFromFetchError };
