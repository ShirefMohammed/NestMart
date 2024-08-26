import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const accessTokenSlice = createSlice({
  name: "accessTokenSlice",
  initialState: "",
  reducers: {
    setAccessToken: (_, action: PayloadAction<string>) => {
      return action.payload;
    },
  },
});

export const { setAccessToken } = accessTokenSlice.actions;
export default accessTokenSlice.reducer;
