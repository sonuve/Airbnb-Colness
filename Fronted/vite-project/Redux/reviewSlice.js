import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    reviews: [],
};

const reviewSlice = createSlice({
    name: "review",
    initialState,
    reducers: {
        setReviews: (state, action) => {
            state.reviews = action.payload;
        },
    },
});

export const { setReviews } = reviewSlice.actions;
export default reviewSlice.reducer;