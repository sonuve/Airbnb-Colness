import React, { memo, useMemo, Suspense } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";

const Nav2 = React.lazy(() => import("../Components/Nav2.jsx"));

function WithList() {

  const listings = useSelector(
    (state) => state.listing.listings,
    shallowEqual
  );

  const savedPosts = useSelector(
    (state) => state.withList.savedPosts,
    shallowEqual
  );

  /* -------- MEMOIZED FILTER -------- */

  const withListListings = useMemo(() => {

    if (!listings?.length || !savedPosts?.length) return [];

    return listings.filter((listing) =>
      savedPosts.includes(listing._id)
    );

  }, [listings, savedPosts]);

  /* -------- EMPTY STATE -------- */

  if (withListListings.length === 0) {

    return (

      <>
        <Suspense fallback={<div>Loading...</div>}>
          <Nav2 />
        </Suspense>

        <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">

          <h2 className="text-xl font-medium">
            ❤️ Your wishlist is empty
          </h2>

          <p className="text-sm mt-2">
            Start saving places you like
          </p>

          <Link
            to="/"
            className="mt-4 bg-rose-500 text-white px-6 py-2 rounded-lg"
          >
            Explore Listings
          </Link>

        </div>
      </>

    );

  }

  /* -------- MAIN UI -------- */

  return (

    <>

      <Suspense fallback={<div>Loading Navbar...</div>}>
        <Nav2 />
      </Suspense>

      <div className="min-h-screen bg-gray-50 py-10 px-4">

        <div className="max-w-7xl mx-auto">

          <h1 className="text-2xl font-semibold mb-6">
            ❤️ Your Wishlist
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

            {withListListings.map((item) => (

              <Link
                key={item._id}
                to={`/room/${item._id}`}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden group"
              >

                {/* IMAGE */}

                <LazyLoadImage
                  src={item?.images?.[0]}
                  alt={item?.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                />

                {/* CONTENT */}

                <div className="p-4 space-y-1">

                  <p className="font-medium truncate">
                    {item?.title}
                  </p>

                  <p className="text-sm text-gray-500">

                    {item?.location?.city},{" "}
                    {item?.location?.country}

                  </p>

                  <p className="text-sm">

                    <span className="font-semibold">
                      ₹{item?.pricePerNight}
                    </span>

                    <span className="text-gray-500">
                      {" "} / night
                    </span>

                  </p>

                </div>

              </Link>

            ))}

          </div>

        </div>

      </div>

    </>

  );

}

export default memo(WithList);