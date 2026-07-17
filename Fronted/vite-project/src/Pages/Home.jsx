import React, { Suspense, useEffect } from "react";

const Nav = React.lazy(() => import("../Components/Nav.jsx"));
const Footer = React.lazy(() => import("../Components/Footer.jsx"));
const ListingsComponent = React.lazy(() =>
  import("../Components/ListingsComponenet.jsx")
);
const ErrorBoundary = React.lazy(() =>
  import("../Components/ErrorBoundary.jsx")
);

import useFetchAllListing from "../../Hook/getAllListing.js";
import useGetCityListings from "../../Hook/getCitywise.js";

function Home() {



 /* ✅ Call hooks directly */
 useFetchAllListing();
 useGetCityListings();


  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      {/* NAVBAR */}
      <Suspense fallback={<div className="p-4">Loading Navbar...</div>}>
        <Nav />
      </Suspense>

      {/* MAIN CONTENT */}
      <main className="flex-1">

        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="flex justify-center items-center mt-20 text-lg">
                Loading listings...
              </div>
            }
          >
            <ListingsComponent />
          </Suspense>
        </ErrorBoundary>

      </main>

      {/* FOOTER */}
      <Suspense fallback={<div className="p-4">Loading Footer...</div>}>
        <Footer />
      </Suspense>

    </div>
  );
}

export default React.memo(Home);