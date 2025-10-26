import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  // Login target for OTP-based auth (email now instead of phone)
  loginTo: string | null;
};

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  loginTo: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoginTarget(state, action: PayloadAction<{ to: string }>) {
      state.loginTo = action.payload.to;
    },
    setTokens(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    signOut(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.loginTo = null;
    },
  },
});

export const { signOut, setTokens, setLoginTarget } = authSlice.actions;
export const authReducer = authSlice.reducer;
