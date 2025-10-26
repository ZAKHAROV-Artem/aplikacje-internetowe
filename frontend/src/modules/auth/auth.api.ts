import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/api/baseQuery";
import { signOut } from "./auth.slice";
import type { ApiResponse } from "magnoli-types";

export type SendVerifyPayload = {
  to: string; // Email address
};

export type SendVerifyResponse = {
  success: true;
};

export type CheckVerifyPayload = {
  to: string; // Email address
  code: string; // 6-digit code
};

// Updated to return tokens
export type CheckVerifyResponse = {
  accessToken: string;
  refreshToken: string;
};

export type RefreshTokenPayload = { refreshToken: string };
export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken?: string;
};

export type SignOutPayload = { refreshToken: string };
export type SignOutResponse = { success: boolean };

// API response types
export type SendVerifyApiResponse = ApiResponse<SendVerifyResponse>;
export type CheckVerifyApiResponse = ApiResponse<CheckVerifyResponse>;
export type RefreshTokenApiResponse = ApiResponse<RefreshTokenResponse>;
export type SignOutApiResponse = ApiResponse<SignOutResponse>;

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth(),
  endpoints: (builder) => ({
    sendVerify: builder.mutation<SendVerifyApiResponse, SendVerifyPayload>({
      query: (body) => ({
        url: "/auth/otp/send",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    }),
    checkVerify: builder.mutation<CheckVerifyApiResponse, CheckVerifyPayload>({
      query: (body) => ({
        url: "/auth/otp/check",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    }),
    refreshToken: builder.mutation<
      RefreshTokenApiResponse,
      RefreshTokenPayload
    >({
      query: (body) => ({
        url: "/auth/refresh",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    }),
    signOut: builder.mutation<SignOutApiResponse, SignOutPayload>({
      query: (body) => ({
        url: "/auth/sign-out",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        await queryFulfilled;
        dispatch(signOut());
      },
    }),
  }),
});

export const {
  useSendVerifyMutation,
  useCheckVerifyMutation,
  useRefreshTokenMutation,
  useSignOutMutation,
} = authApi;
