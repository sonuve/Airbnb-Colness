import React, { useEffect, useCallback, useState, Suspense, memo } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { deleteListing, getUserListings } from "../../Redux/Listing";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LazyLoadImage } from "react-lazy-load-image-component";
const API_URL = import.meta.env.VITE_API_URL;

const Nav2 = React.lazy(() => import("../Components/Nav2.jsx"));

function MyListings() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userListings = useSelector(
    (state) => state.listing.userListing
  ) || [];

  const [loading,setLoading] = useState(true);

  /* -------- FETCH LISTINGS -------- */

  const fetchListings = useCallback(async () => {

    try {

      const res = await axios.get(
        `${API_URL}/api/listing/my/listings`,
        { withCredentials: true }
      );

      if (res.data.success) {

        dispatch(getUserListings(res.data.listings));

      }

    } catch (error) {

      console.error("Failed to fetch listings", error);
      toast.error("Failed to load listings");

    } finally {

      setLoading(false);

    }

  }, [dispatch]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  /* -------- DELETE LISTING -------- */

  const handleDelete = useCallback(async (listingId) => {

    try {

      const res = await axios.delete(
        `${API_URL}/api/listing/delete/${listingId}`,
        { withCredentials: true }
      );

      if (res.data.success) {

        dispatch(deleteListing(listingId));
        toast.success("Listing deleted");

      }

    } catch (error) {

      console.error(error);
      toast.error("Delete failed");

    }

  }, [dispatch]);

  /* -------- LOADING STATE -------- */

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading listings...
      </div>
    );

  }

  /* -------- EMPTY STATE -------- */

  if (!userListings.length) {

    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500 gap-4">

        <h2 className="text-xl">
          You haven't created any listings yet
        </h2>

        <button
          onClick={() => navigate("/create-listing")}
          className="px-5 py-2 bg-rose-500 text-white rounded-lg"
        >
          Create Listing
        </button>

      </div>
    );

  }

  /* -------- UI -------- */

  return (

    <>

      <Suspense fallback={<div>Loading Navbar...</div>}>
        <Nav2/>
      </Suspense>

      <div className="min-h-screen bg-gray-100 py-10 px-4">

        <div className="max-w-6xl mx-auto">

          <h1 className="text-2xl font-semibold mb-6">
            My Listings
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {userListings.map((listing) => (

              <div
                key={listing._id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
              >

                {/* IMAGE */}

                <Link to={`/room/${listing._id}`}>

                  <LazyLoadImage
                    src={listing?.images?.[0]}
                    alt={listing?.title}
                    className="h-52 w-full object-cover"
                  />

                </Link>

                {/* CONTENT */}

                <div className="p-4">

                  <h2 className="font-semibold text-lg truncate">
                    {listing?.title}
                  </h2>

                  <p className="text-sm text-gray-500">

                    {listing?.location?.city},{" "}
                    {listing?.location?.state}

                  </p>

                  <div className="flex justify-between items-center mt-3">

                    <span className="text-rose-500 font-semibold">
                      ₹{listing?.pricePerNight} / night
                    </span>

                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">
                      Active
                    </span>

                  </div>

                  {/* ACTIONS */}

                  <div className="flex gap-3 mt-4">

                    <Link
                      to={`/edit-listing/${listing._id}`}
                      className="flex-1 text-center border border-gray-300 text-sm py-2 rounded-lg hover:bg-gray-100"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(listing._id)}
                      className="flex-1 text-sm py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </>

  );

}

export default memo(MyListings);
