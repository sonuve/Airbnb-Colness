import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { setSavedPosts } from "../../Redux/withList.js";
const CityListing =React.lazy(()=>import("./CityListing.jsx")) ;
const API_URL = import.meta.env.VITE_API_URL;


function ListingsComponent() {

  const dispatch = useDispatch();

  const listings = useSelector((state) => state.listing.listings);
  const filterListings = useSelector((state) => state.listing.filterListings);
  const savedPosts = useSelector((state) => state.withList.savedPosts);
  const cityRows = useSelector((state) => state.city.citys);

  // Memoized listings
  const displayListing = useMemo(() => {
    return filterListings.length > 0 ? filterListings : listings;
  }, [filterListings, listings]);

  // Optimized save handler
  const handleSave = useCallback(async (id) => {
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
    } catch {
      toast.error("Please login first");
    }
  }, [dispatch]);

  return (
    <div className="bg-white py-6">

      {/* ===== HEADING ===== */}
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-6">
          Most Trending Hotels
        </h1>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto px-4 grid grid-flow-col auto-cols-[160px] sm:auto-cols-[180px] md:auto-cols-[200px] lg:auto-cols-[220px] xl:auto-cols-[240px] gap-4 scroll-smooth">

          {displayListing.map((listing) => (
            <CityListing
              key={listing._id}
              listing={listing}
              savedPosts={savedPosts}
              onSave={handleSave}
            />
          ))}

        </div>
      </div>

      {/* ================= CITY WISE ROWS ================= */}
      <div className="mt-10 space-y-12">

        {cityRows.map((row, index) => (
          <section key={index}>

            <h2 className="text-xl md:text-2xl font-semibold mb-4 px-4 max-w-7xl mx-auto">
              {row.title}
            </h2>

            <div className="overflow-x-auto scrollbar-hide">
              <div className="max-w-7xl mx-auto px-4 grid grid-flow-col auto-cols-[160px] sm:auto-cols-[180px] md:auto-cols-[200px] lg:auto-cols-[220px] xl:auto-cols-[240px] gap-4 scroll-smooth">

                {row.listings.map((listing) => (
                  <CityListing
                    key={listing._id}
                    listing={listing}
                    savedPosts={savedPosts}
                    onSave={handleSave}
                  />
                ))}

              </div>
            </div>

          </section>
        ))}

      </div>

    </div>
  );
}

export default React.memo(ListingsComponent);
