import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/api/baseQuery";
import type { ApiResponse } from "magnoli-types";

export type HealthResponse = {
  status?: string;
};

export const healthApi = createApi({
  reducerPath: "healthApi",
  baseQuery,
  endpoints: (builder) => ({
    getHealth: builder.query<ApiResponse<HealthResponse>, void>({
      query: () => ({ url: "/health", method: "GET" }),
    }),
  }),
});

export const { useGetHealthQuery } = healthApi;
