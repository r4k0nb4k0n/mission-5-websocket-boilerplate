import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "../features/chat/chatSlice";

export default configureStore({
  reducer: {
    chat: chatReducer,
  },
});
