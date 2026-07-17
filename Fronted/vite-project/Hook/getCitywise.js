import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCity } from "../Redux/CityWise";
const API_URL = import.meta.env.VITE_API_URL;

const useGetCityListings = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async() => {
            try {
                const res = await axios.get(
                    `${API_URL}/api/listing/city`, { withCredentials: true }
                );


                if (res.data.success) {
                    dispatch(getCity(res.data.rows));
                }
            } catch (error) {
                console.log("fetching city wise data error", error);
            }
        };

        fetchData();
    }, [dispatch]);
};

export default useGetCityListings;
