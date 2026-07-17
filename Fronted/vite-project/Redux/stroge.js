import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // uses localStorage
import { combineReducers } from 'redux';

import authSlice from './authoSlice.js';
import ListingSlice from '../Redux/Listing.js'
import withList from '../Redux/withList.js';
import Booking from '../Redux/Booking.js';
import cityWise from '../Redux/CityWise.js'
import review from '../Redux/reviewSlice.js'
import SocketSlic from '../Redux/SocketSlic.js'
// 1. Combine reducers
const rootReducer = combineReducers({
    // Add your reducers here
    auth: authSlice,
    listing: ListingSlice,
    withList: withList,
    Booking: Booking,
    city: cityWise,
    review: review,
    socket: SocketSlic



});

// 2. Configure persistence
const persistConfig = {
    key: 'root',
    storage,
    blacklist: ['Socket'],
};

// 3. Apply persist to reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Create the store
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Needed for redux-persist
        }),
});

// 5. Export persistor
export const persistor = persistStore(store);