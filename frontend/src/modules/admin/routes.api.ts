import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/api/baseQuery";
import type { ApiResponse } from "magnoli-types";

export interface AdminRoute {
  id: string;
  companyId: string;
  name: string;
  zipCodes: string[];
  weekdays: string[];
  startTimeMins: number;
  endTimeMins: number;
  pricelistId: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRouteInput {
  companyId: string;
  name: string;
  zipCodes: string[];
  weekdays: string[];
  startTimeMins: number;
  endTimeMins: number;
  pricelistId?: string;
  active?: boolean;
}

export interface UpdateRouteInput {
  name?: string;
  zipCodes?: string[];
  weekdays?: string[];
  startTimeMins?: number;
  endTimeMins?: number;
  pricelistId?: string;
  active?: boolean;
}

export const routesApi = createApi({
  reducerPath: "adminRoutesApi",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["Routes"],
  endpoints: (builder) => ({
    listRoutes: builder.query<
      ApiResponse<AdminRoute[]>,
      { companyId?: string } | void
    >({
      query: (params) => {
        const queryParams = params?.companyId
          ? `?companyId=${params.companyId}`
          : "";
        return { url: `/routes${queryParams}`, method: "GET" };
      },
      providesTags: ["Routes"],
    }),
    getRoute: builder.query<ApiResponse<AdminRoute>, string>({
      query: (id) => ({ url: `/routes/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "Routes", id }],
    }),
    createRoute: builder.mutation<ApiResponse<AdminRoute>, CreateRouteInput>({
      query: (body) => ({
        url: "/routes",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Routes"],
    }),
    updateRoute: builder.mutation<
      ApiResponse<AdminRoute>,
      { id: string; data: UpdateRouteInput }
    >({
      query: ({ id, data }) => ({
        url: `/routes/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Routes", id },
        "Routes",
      ],
    }),
    deleteRoute: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/routes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Routes"],
    }),
  }),
});

export const {
  useListRoutesQuery,
  useGetRouteQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
} = routesApi;
