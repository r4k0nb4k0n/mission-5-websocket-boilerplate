import { createSlice } from "@reduxjs/toolkit";

export const chatSlice = createSlice({
  name: "chat",
  initialState: {
    logs: [],
    socket: null,
  },
  reducers: {
    initSocket: (state, action) => {
      state.socket = action.payload;
    },
    appendLog: (state, action) => {
      state.logs = [...state.logs, action.payload];
    },
  },
});

export const { appendLog, initSocket } = chatSlice.actions;

export const selectLogs = (state) => state.chat.logs;
export const selectSocket = (state) => state.chat.socket;

export default chatSlice.reducer;
