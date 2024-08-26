import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { Product } from "@shared/types/entitiesTypes";

type CartState = Product[];

const initialState: CartState = [];

const cartSlice = createSlice({
  name: "cartSlice",
  initialState: initialState,
  reducers: {
    setCart: (_, action: PayloadAction<CartState>) => {
      return action.payload;
    },

    addToCart: (state, action: PayloadAction<Product>) => {
      const existingProductIndex = state.findIndex((product) => product._id === action.payload._id);

      if (existingProductIndex === -1) {
        state.push(action.payload);
      }
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      return state.filter((product) => product._id !== action.payload);
    },
  },
});

export const { setCart, addToCart, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;
