import { createSlice } from "@reduxjs/toolkit";

const ListingSlice = createSlice({
    name: "listing",
    initialState: {
        listings: [],
        userListing: [],
        filterListings: [],
        savePosts: [],
        searchListings: [],
    },
    reducers: {

        addListing: (state, action) => {
            state.listings.unshift(action.payload);
            state.userListing.unshift(action.payload);
        },

        getListings: (state, action) => {
            state.listings = action.payload;
        },

        getUserListings: (state, action) => {
            state.userListing = action.payload;
        },

        deleteListing: (state, action) => {
            state.listings = state.listings.filter(
                (item) => item._id !== action.payload
            );
            state.userListing = state.userListing.filter(
                (item) => item._id !== action.payload
            );
        },

        updateListing: (state, action) => {
            state.listings = state.listings.map((item) =>
                item._id === action.payload._id ? action.payload : item
            );

            state.userListing = state.userListing.map((item) =>
                item._id === action.payload._id ? action.payload : item
            );
        },

        savePost: (state, action) => {
            const postId = action.payload;
            if (state.savePosts.includes(postId)) {
                state.savePosts = state.savePosts.filter((id) => id !== postId);
            } else {
                state.savePosts.push(postId);
            }
        },

        getSearchListings: (state, action) => {
            state.searchListings = action.payload;
        },

        filterByCategroy: (state, action) => {
            const category = action.payload;
            if (category === "Trending") {
                state.filterListings = state.listings;
            } else {
                state.filterListings = state.listings.filter(
                    (item) =>
                    item.category.toLowerCase() ===
                    category.toLowerCase()
                );
            }
        },
    },
});

export const {
    addListing,
    getListings,
    getUserListings,
    deleteListing,
    updateListing,
    savePost,
    getSearchListings,
    filterByCategroy,
} = ListingSlice.actions;

export default ListingSlice.reducer;