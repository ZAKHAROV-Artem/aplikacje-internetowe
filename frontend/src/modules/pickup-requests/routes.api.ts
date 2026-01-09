import { baseQueryWithReauth } from "@/api/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "magnoli-types";

export type Route = {
  id: string;
  name: string;
  zipCodes: string[];
  weekdays: string[];
  startTime: string;
  endTime: string;
  pricelistId: string | null;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  pricelist?: {
    id: string;
    name: string;
    slaDays: number;
  } | null;
};

export const routesApi = createApi({
  reducerPath: "routesApi",
  baseQuery: baseQueryWithReauth(),
  endpoints: (builder) => ({
    getRoutesByZip: builder.query<ApiResponse<{ data: Route[] }>, string>({
      query: (zip) => `/routes/zip/${zip}`,
    }),
  }),
});

export const { useGetRoutesByZipQuery } = routesApi;
