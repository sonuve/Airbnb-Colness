import { createSlice } from "@reduxjs/toolkit";

const SocketSlic = createSlice({
    name: "socket",
    initialState: {
        connected: false,
        BookingDetails: [],
    },
    reducers: {
        // 🔌 Socket connection status
        setSocketConnected: (state, action) => {
            state.connected = action.payload;
        },

        // 🔔 Add new notification (default unread)
        addNotification: (state, action) => {
            state.BookingDetails.unshift({
                ...action.payload,
                isRead: false, // ✅ important
            });
        },

        // ✅ Mark all as read
        markAllAsRead: (state) => {
            state.BookingDetails = state.BookingDetails.map((n) => ({
                ...n,
                isRead: true,
            }));
        },

        // ❌ Clear all notifications
        clearMessages: (state) => {
            state.BookingDetails = [];
        },
    },
});

export const {
    setSocketConnected,
    addNotification,
    markAllAsRead,
    clearMessages,
} = SocketSlic.actions;

export default SocketSlic.reducer;