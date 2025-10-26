import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Order } from "@/lib/schemas";

export type OrdersState = {
  selected?: Order | null;
};

const initialState: OrdersState = {
  selected: null,
};

export const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setSelected(state, action: PayloadAction<Order | null>) {
      state.selected = action.payload;
    },
  },
});

export const { setSelected } = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;
