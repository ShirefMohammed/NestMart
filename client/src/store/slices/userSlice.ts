import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { User } from "@shared/types/entitiesTypes";

let persist: string | boolean | null = localStorage.getItem("persist");

if (persist !== "true" && persist !== "false") {
  localStorage.setItem("persist", "true");
  persist = true;
} else if (persist === "true") {
  persist = true;
} else {
  persist = false;
}

type UserState = Partial<User> & { persist: boolean };

const initialState: UserState = { persist: persist };

const userSlice = createSlice({
  name: "userSlice",
  initialState: initialState,
  reducers: {
    setUser: (_, action: PayloadAction<UserState>) => {
      return action.payload;
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
