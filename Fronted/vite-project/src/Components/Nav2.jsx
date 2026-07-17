import React, { useState, useEffect, useRef, useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { GiHamburgerMenu } from "react-icons/gi";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../Redux/authoSlice";
import { getSearchListings } from "../../Redux/Listing.js";
import { LazyLoadImage } from "react-lazy-load-image-component";
const API_URL = import.meta.env.VITE_API_URL;
function Nav2() {

  const [showPOP, setShowPOP] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const popupRef = useRef(null);
  const debounceRef = useRef(null);
  const cancelToken = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  /* ---------------- USER INITIAL MEMO ---------------- */

  const userInitial = useMemo(() => {
    return user?.name ? user.name[0].toUpperCase() : null;
  }, [user]);

  /* ---------------- CLOSE POPUP ---------------- */

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowPOP(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- LOGOUT ---------------- */

  const handleLogout = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/users/logout`,
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(logout());
        toast.success("Logout Successful");
        navigate("/login");
      }

    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  /* ---------------- SEARCH SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!search.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    try {

      setLoading(true);

      const res = await axios.get(
        `${API_URL}/api/listing/search`,
        {
          params: { title: search },
          withCredentials: true
        }
      );

      if (res.data.success) {

        const listings = res.data.listings;

        if (!listings?.length) {
          toast.error("No hotels found");
          return;
        }

        dispatch(getSearchListings(listings));
        navigate("/search/hotel");

        setSearch("");
        setSuggestions([]);
      }

    } catch (error) {

      console.error("Search failed:", error);
      toast.error("Search failed. Try again.");

    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SEARCH SUGGESTIONS (DEBOUNCE) ---------------- */

  useEffect(() => {

    if (search.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {

      try {

        if (cancelToken.current) {
          cancelToken.current.cancel();
        }

        cancelToken.current = axios.CancelToken.source();

        const res = await axios.get(
          `${API_URL}/api/listing/search`,
          {
            params: { title: search },
            cancelToken: cancelToken.current.token
          }
        );

        if (res.data.success) {
          setSuggestions(res.data.listings.slice(0, 5));
        }

      } catch (err) {

        if (!axios.isCancel(err)) {
          console.error(err);
        }

      }

    }, 400);

    return () => clearTimeout(debounceRef.current);

  }, [search]);

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full bg-white sticky top-0 z-50 shadow-sm">

      <div className="w-full h-20 border-b border-gray-200 px-4 md:px-6 flex items-center justify-between">

        {/* LOGO */}

        <Link to="/">
          <LazyLoadImage
            src="https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg"
            alt="Airbnb"
            width={120}
            height={40}
            className="cursor-pointer"
          />
        </Link>

        {/* DESKTOP SEARCH */}

        <form onSubmit={handleSubmit} className="hidden md:flex relative flex-col">

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hotels..."
            className="w-[420px] h-[48px] border border-gray-300 rounded-full px-6 pr-14 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fe395c]"
          />

          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#fe395c] p-3 rounded-full text-white hover:bg-[#e63755] transition disabled:opacity-50"
          >
            {loading ? "..." : <FaSearch />}
          </button>

          {/* SUGGESTIONS */}

          {suggestions.length > 0 && (

            <div className="absolute top-[55px] w-full bg-white shadow-lg rounded-xl max-h-60 overflow-y-auto z-50">

              {suggestions.map((item) => (

                <div
                  key={item._id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => {
                    navigate(`/room/${item._id}`);
                    setSearch("");
                    setSuggestions([]);
                  }}
                >
                  {item.title}
                </div>

              ))}

            </div>

          )}

        </form>

        {/* PROFILE MENU */}

        <div className="flex items-center gap-4 relative">

          <div
            onClick={() => setShowPOP(!showPOP)}
            className="flex items-center gap-3 border border-gray-300 rounded-full px-4 py-2 cursor-pointer hover:shadow-md transition"
          >

            <GiHamburgerMenu />

            {user ? (

              <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">
                {userInitial}
              </span>

            ) : (

              <CgProfile size={22} />

            )}

          </div>

          {showPOP && (

            <div
              ref={popupRef}
              className="absolute top-full right-0 mt-3 w-56 bg-white border rounded-lg shadow-lg z-50"
            >

              <ul className="py-3 text-sm text-center space-y-2">

                {!user && (
                  <>
                    <Link to="/login"><li>Login</li></Link>
                    <Link to="/signup"><li>Signup</li></Link>
                  </>
                )}

                <Link to="/save"><li>Wishlist</li></Link>

                <Link to="/my/listings"><li>My Listings</li></Link>

                <Link to="/hotel/booking"><li>Check Booking</li></Link>

                <li
                  className="cursor-pointer hover:underline"
                  onClick={() => navigate("/create-listing")}
                >
                  Add Listing
                </li>

                {user && (
                  <li
                    className="text-red-600 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </li>
                )}

              </ul>

            </div>

          )}

        </div>

      </div>

      {/* MOBILE SEARCH */}

      <div className="md:hidden px-4 py-3 bg-gray-50">

<form onSubmit={handleSubmit} className="relative">

  <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search hotels..."
    className="w-full h-12 border border-gray-300 rounded-full pl-4 pr-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fe395c]"
  />

  <button
    type="submit"
    disabled={loading}
    className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#fe395c] p-2.5 rounded-full text-white"
  >
    {loading ? "..." : <FaSearch size={14} />}
  </button>

  {/* ✅ ADD THIS (MOBILE SUGGESTIONS) */}
  {suggestions.length > 0 && (
    <div className="absolute top-[55px] left-0 right-0 bg-white shadow-lg rounded-xl max-h-60 overflow-y-auto z-[9999] border">

      {suggestions.map((item) => (
        <div
          key={item._id}
          className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm"
          onClick={() => {
            navigate(`/room/${item._id}`);
            setSearch("");
            setSuggestions([]);
          }}
        >
          <p className="font-medium">{item.title}</p>
          <p className="text-xs text-gray-500">
            {item.location?.city}, {item.location?.state}
          </p>
        </div>
      ))}

    </div>
  )}

</form>

</div>

    </div>
  );
}

export default Nav2;
