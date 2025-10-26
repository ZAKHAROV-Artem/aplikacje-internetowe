import { createSlice } from "@reduxjs/toolkit";

type SettingsState = {
  theme: "light";
};

const initialState: SettingsState = {
  theme: "light",
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    // Theme is always light, no need for setTheme action
  },
});

export const settingsReducer = settingsSlice.reducer;
