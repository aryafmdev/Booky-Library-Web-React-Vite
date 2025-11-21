import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CartState {
  quantity: number;
  items: string[]; // bisa diganti ke objek Book kalau perlu
}

const initialState: CartState = {
  quantity: 0,
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<string>) => {
      state.items.push(action.payload);
      state.quantity = state.items.length;
    },
    removeItem: (state, action: PayloadAction<string>) => {
      const idx = state.items.findIndex((item) => item === action.payload);
      if (idx !== -1) state.items.splice(idx, 1);
      state.quantity = state.items.length;
    },
    clearCart: (state) => {
      state.items = [];
      state.quantity = 0;
    },
    setItems: (state, action: PayloadAction<string[]>) => {
      state.items = action.payload;
      state.quantity = state.items.length;
    },
  },
});

export const { addItem, removeItem, clearCart, setItems } = cartSlice.actions;
export default cartSlice.reducer;
