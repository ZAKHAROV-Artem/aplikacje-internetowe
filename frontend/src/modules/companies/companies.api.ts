import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/api/baseQuery";
import type { ApiResponse } from "magnoli-types";

export interface Company {
  id: string;
  name: string;
  description: string | null;
  managerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCompanyInput {
  name?: string;
  description?: string;
}

export const companiesApi = createApi({
  reducerPath: "companiesApi",
  baseQuery,
  tagTypes: ["Company"],
  endpoints: (builder) => ({
    getCompanyInfo: builder.query<ApiResponse<Company>, void>({
      query: () => ({ url: "companies/info", method: "GET" }),
      providesTags: ["Company"],
    }),
    updateCompany: builder.mutation<
      ApiResponse<Company>,
      { id: string; data: UpdateCompanyInput }
    >({
      query: ({ id, data }) => ({
        url: `/companies/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Company"],
    }),
  }),
});

export const {
  useGetCompanyInfoQuery,
  useLazyGetCompanyInfoQuery,
  useUpdateCompanyMutation,
} = companiesApi;
