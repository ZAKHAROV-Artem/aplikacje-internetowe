import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/api/baseQuery";
import type { ApiResponse, Rule } from "magnoli-types";
import type { Customer, CustomerLocation } from "magnoli-types";
import { signOut } from "@/modules/auth/auth.slice";

export type UpdateMeRequest = {
  firstName?: string;
  lastName?: string;
  location?: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
};

export const customersApi = createApi({
  reducerPath: "customersApi",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["Me", "CustomerRules"],
  endpoints: (builder) => ({
    getMe: builder.query<ApiResponse<Customer>, void>({
      query: () => ({ url: "/customers/me", method: "GET" }),
      providesTags: ["Me"],
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
        } catch {
          // If fetching the current user fails for any reason (e.g. 4xx/5xx),
          // immediately sign the user out to prevent repeated requests.
          dispatch(signOut());
        }
      },
    }),
    getCustomerRules: builder.query<ApiResponse<Rule[]>, string>({
      query: (customerId) => ({
        url: `/customers/rules/${customerId}`,
        method: "GET",
      }),
      providesTags: ["CustomerRules"],
    }),
    toggleCustomerRule: builder.mutation<
      ApiResponse<void>,
      { isActive: boolean; ruleId: string }
    >({
      query: ({ ruleId, isActive }) => ({
        url: `/customers/rules/${ruleId}/toggle`,
        body: {
          isActive,
        },
        method: "PATCH",
      }),
      invalidatesTags: ["CustomerRules"],
    }),
    updateMe: builder.mutation<ApiResponse<Customer>, UpdateMeRequest>({
      query: (body) => ({
        url: "/customers/me",
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: ["Me"],
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useGetCustomerRulesQuery,
  useToggleCustomerRuleMutation,
} = customersApi;

// Re-export types for convenience
export type { CustomerLocation };
export type ApiCustomerLocation = CustomerLocation;
