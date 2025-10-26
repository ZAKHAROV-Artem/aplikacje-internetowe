import { fetchJSON, fetchJSONWithAuth } from "../utils/fetch.utils";
import { authTokenService } from "./auth-token.service";
import { serviceAuthService } from "./service-auth.service";

class ApiService {
  private baseUrl: string;

  constructor(baseUrlEnvVar: string) {
    this.baseUrl = process.env[baseUrlEnvVar] || "";
    if (!this.baseUrl) {
      throw new Error(`Environment variable ${baseUrlEnvVar} is not set`);
    }
  }

  async delete(endpoint: string, serviceAuth = false) {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      return this.makeRequest(
        url,
        { method: "DELETE" },
        serviceAuth,
        undefined
      );
    } catch (error) {
      throw new Error(
        `Invalid URL: ${this.baseUrl}${endpoint}. Please check POS_API_URL environment variable.`
      );
    }
  }

  async get<T>(
    endpoint: string,
    params: Record<string, unknown> | boolean,
    serviceAuthFlag?: boolean,
    magnoliCustomerId?: string
  ) {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      let serviceAuth = false;
      // params could be boolean when caller wants to force service auth without query params
      if (typeof params === "boolean") {
        serviceAuth = params;
      } else if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.append(key, String(value));
          }
        });
        serviceAuth = Boolean(serviceAuthFlag);
      } else {
        serviceAuth = Boolean(serviceAuthFlag);
      }

      return this.makeRequest<T>(
        url,
        { method: "GET" },
        serviceAuth,
        magnoliCustomerId
      );
    } catch (error) {
      throw new Error(
        `Invalid URL: ${this.baseUrl}${endpoint}. Please check POS_API_URL environment variable.`
      );
    }
  }

  async patch<T>(
    endpoint: string,
    body: unknown,
    serviceAuth = false,
    magnoliCustomerId?: string
  ) {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      return this.makeRequest<T>(
        url,
        {
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          method: "PATCH",
        },
        serviceAuth,
        magnoliCustomerId
      );
    } catch (error) {
      throw new Error(
        `Invalid URL: ${this.baseUrl}${endpoint}. Please check POS_API_URL environment variable.`
      );
    }
  }

  async post<T>(
    endpoint: string,
    body: unknown,
    serviceAuth = false,
    magnoliCustomerId?: string
  ) {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      return this.makeRequest<T>(
        url,
        {
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
        serviceAuth,
        magnoliCustomerId
      );
    } catch (error) {
      throw new Error(
        `Invalid URL: ${this.baseUrl}${endpoint}. Please check POS_API_URL environment variable.`
      );
    }
  }

  async put<T>(
    endpoint: string,
    body: unknown,
    serviceAuth = false,
    magnoliCustomerId?: string
  ) {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      return this.makeRequest<T>(
        url,
        {
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          method: "PUT",
        },
        serviceAuth,
        magnoliCustomerId
      );
    } catch (error) {
      throw new Error(
        `Invalid URL: ${this.baseUrl}${endpoint}. Please check POS_API_URL environment variable.`
      );
    }
  }

  makeRequest<T>(
    url: URL,
    options: {
      method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
      url?: string;
      headers?: Record<string, string>;
      body?: any;
      timeout?: number;
    },
    forceServiceAuth = false,
    magnoliCustomerId?: string
  ) {
    let token = null;

    if (!forceServiceAuth) {
      token = authTokenService.getToken();
    }

    if (!token) {
      try {
        token = serviceAuthService.getToken(magnoliCustomerId);
      } catch (error) {
        // If SERVICE_AUTH_SECRET isn't configured, fallback to unauthenticated request
        token = null;
      }
    }

    if (token) {
      return fetchJSONWithAuth<T>(url, token, options);
    }

    return fetchJSON<T>(url, options);
  }
}

// Create instance specifically for Magnoli POS API
const hqApiService = new ApiService("HQ_API_URL");
const posApiService = new ApiService("POS_API_URL");
export { hqApiService, posApiService };
