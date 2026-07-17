import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    Bookings: [], //  ALWAYS ARRAY
};

const bookingSlice = createSlice({
    name: "Booking",
    initialState,
    reducers: {
        setBooking: (state, action) => {
            state.Bookings = Array.isArray(action.payload) ?
                action.payload : [action.payload]; //safety
        },
    },
});

export const { setBooking } = bookingSlice.actions;
export default bookingSlice.reducer;