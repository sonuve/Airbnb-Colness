import React, { useState, useEffect, useRef, useCallback, memo, Suspense } from "react";
import { FaSearch } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoNotificationsOutline, IoClose } from "react-icons/io5";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../Redux/authoSlice";
import { getSearchListings } from "../../Redux/Listing.js";
import { markAllAsRead } from "../../Redux/SocketSlic.js";
const Category= React.lazy(()=>import("./Category.jsx")) ;
const NotificationListener= React.lazy(()=>import("./NotificationListener.jsx")) ;
import { LazyLoadImage } from "react-lazy-load-image-component";
const HotelSlider =React.lazy(()=>import("./HotelSlider.jsx")) ;
const API_URL = import.meta.env.VITE_API_URL;
function Nav() {

  const [showPOP, setShowPOP] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const listings = useSelector((state) => state.listing.listings);

  const popupRef = useRef(null);
  const notifyRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const notifications =
    useSelector((state) => state.socket.BookingDetails) || [];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ================= CLOSE OUTSIDE =================
  useEffect(() => {
    const handleClickOutside = (e) => {

      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowPOP(false);
      }

      if (notifyRef.current && !notifyRef.current.contains(e.target)) {
        setShowNotify(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================= SEARCH =================
  const handleSubmit = useCallback(async (e) => {

    e.preventDefault();

    const trimmedSearch = search.trim();

    if (!trimmedSearch) {
      toast.error("Please enter search");
      return;
    }

    try {

      setLoading(true);

      const res = await axios.get(
        `${API_URL}/api/listing/search`,
        {
          params: { title: trimmedSearch },
          withCredentials: true
        }
      );

      if (!res.data.success) {
        toast.error("Search failed");
        return;
      }

      dispatch(getSearchListings(res.data.listings || []));

      navigate("/search/hotel");

      setSearch("");
      setSuggestions([]);
      setShowMobileSearch(false);

    } catch (err) {

      toast.error("Something went wrong");

    } finally {

      setLoading(false);

    }

  }, [search, dispatch, navigate]);

  // ================= SEARCH SUGGESTION =================
  useEffect(() => {

    const controller = new AbortController();

    const fetchSuggestions = async () => {

      if (search.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {

        const res = await axios.get(
          `${API_URL}/api/listing/search`,
          {
            params: { title: search },
            signal: controller.signal
          }
        );

        if (res.data.success) {
          setSuggestions(res.data.listings.slice(0, 5));
        }

      } catch (err) {
        if (err.name !== "CanceledError") {
          console.log(err);
        }
      }
    };

    const debounce = setTimeout(fetchSuggestions, 400);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };

  }, [search]);

  // ================= LOGOUT =================
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

    } catch (err) {

      console.log(err);

    }

  };


  return (
    <div className="w-full mb-20">

      {user && <NotificationListener />}

      {/* NAVBAR */}
      <div className="w-full h-[80px] border-b border-gray-200 px-4 md:px-6 flex items-center justify-between bg-white fixed top-0 left-0 z-50">

        {/* LOGO */}
        <Link to="/">
          <div className="w-28 md:w-32 h-[32px]">
            <LazyLoadImage
              src="https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg"
              alt="Airbnb"
              width={128}
              height={32}
              className="w-full h-full object-contain"
            />
          </div>
        </Link>

        {/* DESKTOP SEARCH */}
        <form
          onSubmit={handleSubmit}
          className="hidden md:flex relative flex-col"
        >

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hotels..."
            className="w-[420px] h-[48px] border border-gray-300 rounded-full px-6 pr-14 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fe395c]"
          />

          <button
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#fe395c] p-3 rounded-full text-white"
          >
            {loading ? "..." : <FaSearch />}
          </button>

          {/* SUGGESTIONS */}
          {suggestions.length > 0 && (

            <div className="absolute top-[55px] w-full bg-white shadow-lg rounded-xl max-h-60 overflow-y-auto z-50 min-h-[120px]">

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

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4 relative">

          {/* MOBILE SEARCH */}
          <button
            onClick={() => setShowMobileSearch(true)}
            className="md:hidden p-2 rounded-full hover:bg-gray-200"
          >
            <FaSearch size={18} />
          </button>

          {/* NOTIFICATION */}
         {/* NOTIFICATION */}
{user && (
  <div className="relative" ref={notifyRef}>

    {/* Bell Icon */}
    <button
      onClick={() => {
        setShowNotify(!showNotify);
        setShowPOP(false);

        if (!showNotify) {
          dispatch(markAllAsRead());
        }
      }}
      className="p-2 rounded-full hover:bg-gray-200 relative"
    >
      <IoNotificationsOutline size={22} />
      {/* Badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] rounded-full font-bold">
          {unreadCount}
        </span>
      )}
    </button>

    {/* Dropdown */}
    {showNotify && (
      <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-xl z-50 flex flex-col border border-gray-200">

        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <h3 className="font-semibold text-gray-800">Notifications</h3>
          <button
            onClick={() => dispatch(markAllAsRead())}
            className="text-xs text-[#fe395c] hover:underline"
          >
            Mark all read
          </button>
        </div>

        {/* Scrollable notifications */}
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-gray-500 text-center">
              No notifications
            </p>
          ) : (
            notifications.map((n, i) => (
              <div
                key={i}
                className={`flex justify-between items-start px-4 py-3 text-sm border-b hover:bg-gray-50 transition ${
                  !n.isRead ? "bg-gray-50 font-semibold" : ""
                }`}
              >
                <div
                  className="cursor-pointer flex-1"
                  onClick={() => {
                    navigate(`/host/booking/${n.bookingId}`);
                    setShowNotify(false);
                  }}
                >
                  <p>{n.guestName} booked {n.listingTitle}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(n.checkIn).toLocaleDateString()} → {new Date(n.checkOut).toLocaleDateString()}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={async (e) => {
                    e.stopPropagation(); // prevent parent click
                    try {
                      const res = await axios.delete(`${API_URL}/api/notifications/${n._id}`, { withCredentials: true });
                      if (res.data.success) {
                        toast.success("Notification deleted");
                        // Ideally dispatch action to remove from Redux
                        // dispatch(deleteNotification(n._id));
                      }
                    } catch (err) {
                      toast.error("Delete failed");
                    }
                  }}
                  className="ml-2 text-red-500 hover:text-red-700 text-xs"
                  title="Delete notification"
                >
                  
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    )}
  </div>
)}

          {/* MENU */}
          <div className="relative">

            <div
              onClick={() => {
                setShowPOP(!showPOP);
                setShowNotify(false);
              }}
              className="flex items-center gap-3 border border-gray-300 rounded-full px-4 py-2 cursor-pointer"
            >

              <GiHamburgerMenu />

              <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">

                {user ? user.name?.[0]?.toUpperCase() : <CgProfile size={18} />}

              </span>

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
                    className="cursor-pointer"
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

      </div>

      {/* MOBILE SEARCH */}
      {showMobileSearch && (

          <div className="fixed inset-0 bg-white z-[9999] p-4 md:hidden min-h-screen overflow-visible">
          <div className="flex items-center gap-3">

            <button onClick={() => setShowMobileSearch(false)}>
              <IoClose size={24} />
            </button>

            <form
  onSubmit={handleSubmit}
  className="relative w-full flex-1"
>

  <input
    autoFocus
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search hotels..."
    className="w-full border border-gray-300 rounded-full pl-4 pr-12 py-2 focus:outline-none focus:ring-2 focus:ring-[#fe395c]"
  />

  <button
    disabled={loading}
    className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#fe395c] p-2 rounded-full text-white"
  >
    {loading ? "..." : <FaSearch size={14} />}
  </button>

  {/* ✅ ADD THIS BLOCK (VERY IMPORTANT) */}
  {suggestions.length > 0 && (
    <div className="absolute top-[50px] left-0 right-0 bg-white shadow-lg rounded-xl max-h-60 overflow-y-auto z-[9999] border">

      {suggestions.map((item) => (
        <div
          key={item._id}
          className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm"
          onClick={() => {
            navigate(`/room/${item._id}`);
            setSearch("");
            setSuggestions([]);
            setShowMobileSearch(false); // close popup
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

      )}

     {/* CATEGORY */}
     <div className="sticky top-[80px] bg-white z-40 mt-20">
  <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
    <Suspense
      fallback={
        <div className="text-center py-4">Loading categories...</div>
      }
    >
      <Category />
    </Suspense>
  </div>
</div>

{/* FEATURED HOTELS SLIDER */}
<div className="mt-8 px-4 md:px-6">
  <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900">
    🌟 Explore Our Top-Rated Stays
  </h2>
  <p className="text-gray-600 mb-6 md:text-lg">
    Handpicked hotels just for you — click to see full details and book instantly!
  </p>
  <HotelSlider hotels={listings} />
</div>

    </div>
  );
}

export default memo(Nav);
