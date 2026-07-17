import { createSlice } from "@reduxjs/toolkit";
const withList = createSlice({
    name: "withList",
    initialState: {
        savedPosts: [], // array of listing IDs
    },
    reducers: {
        setSavedPosts: (state, action) => {
            state.savedPosts = action.payload;
        },
    },
});

export const { setSavedPosts } = withList.actions;
export default withList.reducer;