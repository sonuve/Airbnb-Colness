import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getListings } from "../Redux/Listing.js";
const API_URL = import.meta.env.VITE_API_URL;

const useFetchAllListing = () => {
    const dispatch = useDispatch();

    const fetchListings = async() => {
        try {
            const res = await axios.get(`${API_URL}/api/listing/all/listings`, { withCredentials: true });

            if (res.data.success) {
                dispatch(getListings(res.data.listings));
            }

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    return fetchListings;
};

export default useFetchAllListing;
