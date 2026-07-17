import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import Nav2 from "./Nav2";
import { setSavedPosts } from "../../Redux/withList.js";
const SearchComponenet= React.lazy(()=>import("./SearchComponenet.jsx")) ;
const API_URL = import.meta.env.VITE_API_URL;

function SearchPages() {
  const dispatch = useDispatch();

  const searchData = useSelector((state) => state.listing.searchListings) || [];
  const savedPosts = useSelector((state) => state.withList.savedPosts) || [];
  const loading = useSelector((state) => state.listing.loading);

  // ✅ Prevent function re-creation
  const handleSave = useCallback(
    async (id) => {
      try {
        const res = await axios.post(
          `${API_URL}/api/users/save/${id}`,
          {},
          { withCredentials: true }
        );

        if (res.data.success) {
          dispatch(setSavedPosts(res.data.savedPosts));
          toast.success(res.data.message);
        }
      } catch (error) {
        toast.error("Please login first");
      }
    },
    [dispatch]
  );

  return (
    <>
      <Nav2 />

      <div className="bg-white min-h-screen py-10 px-4 mt-20">

        {/* ✅ Loading Skeleton */}
        {loading && (
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 animate-pulse">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                <div className="bg-gray-200 rounded-xl aspect-[7/6]" />
                <div className="mt-2 h-4 bg-gray-200 w-3/4 rounded" />
                <div className="mt-1 h-3 bg-gray-200 w-1/2 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* ❌ No Results */}
        {!loading && searchData.length === 0 && (
          <div className="text-center text-gray-500 text-lg">
            No hotels found
          </div>
        )}

        {/* ✅ Results */}
        {!loading && searchData.length > 0 && (
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {searchData.map((item) => (
              <SearchComponenet
                key={item._id}
                item={item}
                savedPosts={savedPosts}
                handleSave={handleSave}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default SearchPages;
