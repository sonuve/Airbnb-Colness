import { createSlice } from "@reduxjs/toolkit";

const CityWise = createSlice({
    name: "city",
    initialState: {
        citys: [],
    },
    reducers: {
        getCity: (state, action) => {
            state.citys = action.payload;
        },
    },
});

export const { getCity } = CityWise.actions;
export default CityWise.reducer;