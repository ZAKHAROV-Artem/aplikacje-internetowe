import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/api/baseQuery";
import type { ApiResponse } from "magnoli-types";

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "COMPANY_MANAGER" | "USER";
  companyId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "COMPANY_MANAGER" | "USER";
  companyId?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  role?: "ADMIN" | "COMPANY_MANAGER" | "USER";
  companyId?: string;
  isActive?: boolean;
}

export const usersApi = createApi({
  reducerPath: "adminUsersApi",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    listUsers: builder.query<ApiResponse<AdminUser[]>, void>({
      query: () => ({ url: "/users", method: "GET" }),
      providesTags: ["Users"],
    }),
    getUser: builder.query<ApiResponse<AdminUser>, string>({
      query: (id) => ({ url: `/users/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "Users", id }],
    }),
    createUser: builder.mutation<ApiResponse<AdminUser>, CreateUserInput>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Users"],
    }),
    updateUser: builder.mutation<
      ApiResponse<AdminUser>,
      { id: string; data: UpdateUserInput }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Users", id },
        "Users",
      ],
    }),
    deleteUser: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useListUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
