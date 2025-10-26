import { baseQueryWithReauth } from "@/api/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "magnoli-types";

export type Route = {
  id: string;
  name: string;
  zipCodes: string[];
  weekdays: number[];
  startTimeMins: number | null;
  endTimeMins: number | null;
  pricelistId: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  pricelist: {
    id: string;
    name: string;
    slaDays: number;
  };
};

// API response types
export type RoutesByZipApiResponse = ApiResponse<{ data: Route[] }>;

export const routesApi = createApi({
  reducerPath: "routesApi",
  baseQuery: baseQueryWithReauth(),
  endpoints: (builder) => ({
    getRoutesByZip: builder.query<RoutesByZipApiResponse, string>({
      query: (zip) => `/routes/zip/${zip}`,
    }),
  }),
});

export const { useGetRoutesByZipQuery } = routesApi;
