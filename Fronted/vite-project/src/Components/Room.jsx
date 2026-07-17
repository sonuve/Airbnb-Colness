import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { GiCombinationLock } from "react-icons/gi";
import { GrNotes } from "react-icons/gr";
import { GrFan } from "react-icons/gr";
import { FaWifi } from "react-icons/fa";
import { MdOutlineDoorSliding } from "react-icons/md";
import { MdSmokeFree } from "react-icons/md";
import { FaKitchenSet } from "react-icons/fa6";
import { FaTv } from "react-icons/fa";
import { GiCctvCamera } from "react-icons/gi";
import { BsPersonWorkspace } from "react-icons/bs";
import { ImCross } from "react-icons/im";
import { BsCarFront } from "react-icons/bs";
import Footer from "./Footer";
import axios from "axios";
import toast from "react-hot-toast";
import Nav2 from "./Nav2";
import { loadCashfreeSDK } from "../../Utiles/loadsCashfree.js";
const CommentsPages = React.lazy(() => import("../Pages/CommentsPages.jsx"));
import { setBooking } from "../../Redux/Booking.js";
import { setReviews } from "../../Redux/reviewSlice.js";
import { LazyLoadImage } from "react-lazy-load-image-component";
const API_URL = import.meta.env.VITE_API_URL;

function Room() {
  const { id } = useParams();
  const { listings } = useSelector((state) => state.listing);
  const { user } = useSelector((state) => state.auth);
  const  bookings  = useSelector((state) => state.Booking.Bookings);
  console.log("bookings",bookings);
 
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const listing = useMemo(
    () => listings?.find((item) => item._id === id),
    [listings, id]
  );

  console.log(listing);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [available, setAvailable] = useState(true);
  const [checking, setChecking] = useState(false);

  // const reviews = useSelector((state) => state.Booking.Reverse);

  // 👉 Today's date (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];

  // 👉 Calculate number of nights
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = (end - start) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);



  useEffect(() => {
    if (!user) return;
  
    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/booking/my`,
          { withCredentials: true }
        );
  
        dispatch(setBooking(res.data.bookings));
      } catch (err) {
        console.log(err);
      }
    };
  
    // run once immediately
    fetchBookings();
  
    // run every 20 seconds
    const interval = setInterval(fetchBookings, 20000);
  
    return () => clearInterval(interval);
  }, [user, dispatch]);



    // review permission
  
    const canReview =
    !!user &&
    !!listing &&
    Array.isArray(bookings) &&
    bookings.some((b) => {
      return (
        b?.listing?._id?.toString() === listing?._id?.toString() &&
        b?.status === "completed" &&
        b?.reviewed === false &&
        b?.user?.toString() === user?.id?.toString()
      );
    });
  
  console.log("canReview:", canReview);

  //Show the review box only if the user has stayed at the hotel
  // useEffect(() => {
  //   if (!listing?._id) return;

  //   const controller = new AbortController();

  //   const fetchReviews = async () => {
  //     try {
  //       const res = await axios.get(
  //         `http://localhost:3000/api/review/comments/${listing._id}`,
  //         { signal: controller.signal }
  //       );

  //       if (res.data.success) {
  //         dispatch(setReviews(res.data.reviews));
  //       }
  //     } catch (error) {}
  //   };

  //   fetchReviews();

  //   return () => controller.abort();
  // }, [listing?._id, dispatch]);

  // const { reviews } = useSelector((state) => state.review);

// Fetch reviews again after user posts comment
const fetchReviews = async () => {
  if (!listing?._id) return;

  try {
    const res = await axios.get(
      `${API_URL}/api/review/comments/${listing._id}`
    );

    if (res.data.success) {
      dispatch(setReviews(res.data.reviews));
    }
  } catch (error) {
    console.log(error);
  }
};
useEffect(() => {
  if (!listing?._id) return;
  fetchReviews();
}, [listing?._id]);

  //hotel bookeing function
  const handleReservePayment = async () => {
    if (!checkIn || !checkOut || nights === 0) {
      toast.error("Please select valid dates");
      return;
    }

    try {
      setBookingLoading(true);

      const res = await axios.post(
        `${API_URL}/api/booking/reserve/${listing._id}`,
        {
          checkIn,
          checkOut,
          guests,
          totalPrice: totalPrice + 500,
        },
        { withCredentials: true }
      );

      if (!res.data.bookingId) {
        toast.error("Booking creation failed");
        setBookingLoading(false);
        return;
      }

      // 👉 Start payment
      await handlePayment(res.data.bookingId);
    } catch (error) {
      console.error(error);
      toast.error("Unable to start payment");
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    if (!checkIn || !checkOut || !listing?._id) return;

    const checkAvailability = async () => {
      setChecking(true);
      try {
        const res = await axios.get(`${API_URL}/api/booking/check`, {
          params: {
            listingId: listing._id,
            checkIn,
            checkOut,
          },
        },{withCredentials:true});

        setAvailable(res.data.available);
      } catch (error) {
        setAvailable(false);
      }
      setChecking(false);
    };

    checkAvailability();
  }, [checkIn, checkOut, listing?._id]);

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto p-6 animate-pulse">
        <div className="h-8 bg-gray-200 w-1/3 mb-4 rounded"></div>
        <div className="h-80 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }
  // 👉 Total Price
  const totalPrice = nights * listing.pricePerNight;

  // Payment Handler
  const handlePayment = async (bookingId) => {
    try {
      setPaymentLoading(true);

      await loadCashfreeSDK();

      const res = await axios.post(
        `${API_URL}/api/payment/create`,
        { bookingId },
        { withCredentials: true }
      );

      const { paymentSessionId } = res.data;

      if (!paymentSessionId) {
        toast.error("Payment session not created");
        setPaymentLoading(false);
        return;
      }

      const cashfree = window.Cashfree({ mode: "sandbox" });

      cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_self",

        onSuccess: async () => {
          toast.success("Payment completed successfully!");

          const bookingRes = await axios.get(
            `${API_URL}/api/booking/my`,
            { withCredentials: true }
          );

          dispatch(setBooking(bookingRes.data.bookings));

          setPaymentLoading(false);
          navigate("/hotel/booking");
        },

        onFailure: () => {
          toast.error("Payment failed. Try again.");
          setPaymentLoading(false);
        },

        onAbort: () => {
          toast("Payment was cancelled.");
          setPaymentLoading(false);
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Unable to start payment");
      setPaymentLoading(false);
    }
  };

  const reviews = useSelector((state) => state.review.reviews || []);
  const reviewsList = useMemo(() => {
    return reviews?.map((rev) => (
      <div key={rev._id} className="border rounded-xl p-4 bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <img
            src={rev.user?.avatar || "https://i.pravatar.cc/40"}
            width={32}
            height={32}
            loading="lazy"
            className="w-8 h-8 rounded-full object-cover"
            alt="user"
          />

          <div>
            <p className="font-semibold text-sm">{rev.user?.name}</p>
            <p className="text-xs text-gray-500">⭐ {rev.rating} / 5</p>
          </div>
        </div>

        <p className="text-gray-700 text-sm">{rev.comment}</p>
      </div>
    ));
  }, [reviews]);

  return (
    <>
      <Nav2 />

      <div className="max-w-7xl mx-auto px-4 py-6 ">
        {/* ================= Title ================= */}
        <h1 className="text-2xl md:text-3xl font-semibold">{listing.title}</h1>
        <p className="text-gray-600 mt-1">
          {listing.location?.city}, {listing.location?.country}
        </p>

      
        {/* ================= Images ================= */}
<div className="mt-5">
  {!listing?.images || listing.images.length === 0 ? (
    <div className="w-full h-[400px] bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
      No Images Available
    </div>
  ) : (
    <>
      {/* MOBILE VIEW */}
      <div className="md:hidden flex overflow-x-auto gap-3 snap-x snap-mandatory scroll-smooth pb-4">
        {listing.images.map((img, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[90vw] h-[260px] bg-gray-100 rounded-2xl overflow-hidden snap-center"
          >
            <LazyLoadImage
              src={img}
              alt={`Listing ${i + 1}`}
              width="100%"
              height="100%"
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[500px] rounded-2xl overflow-hidden">
        <div className="col-span-2 row-span-2 overflow-hidden">
          <LazyLoadImage
            src={listing.images?.[0]}
            alt="Main Listing"
            width="100%"
            height="100%"
            className="w-full h-full object-cover object-center hover:brightness-90 transition duration-300"
          />
        </div>

        {listing.images?.slice(1, 5).map((img, i) => (
          <div key={i} className="overflow-hidden">
            <LazyLoadImage
              src={img}
              alt={`Listing ${i + 2}`}
              width="100%"
              height="100%"
             
              className="w-full h-full object-cover object-center hover:brightness-90 transition duration-300"
            />
          </div>
        ))}
      </div>
    </>
  )}
</div>

        {/* ================= Content ================= */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 px-4 md:px-6">
          {/* Right Content */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Title & Details */}
            <h2 className="font-bold text-xl md:text-2xl">
              Enter {listing?.title} in{" "}
              {listing?.location?.city}, {listing?.location?.country}{" "}
            </h2>
            <div className="flex flex-wrap gap-3 text-sm md:text-base text-gray-600">
              <span>{listing?.maxGuests} guests</span>
              <span>{listing?.bedrooms} bedroom</span>
              <span>{listing?.beds} beds</span>
              <span>{listing?.washrooms} washroom</span>
            </div>

            {/* Featured Section */}
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 border rounded-2xl p-2">
              <LazyLoadImage
                className="w-full sm:w-45 h-24 sm:h-24 object-cover rounded-md"
                src="https://static.wixstatic.com/media/7154e9_1d4ecb67420947bf9cacb201b8bca8b9~mv2.png"
                alt="logo"
              />
              <p className="flex-1 text-sm sm:text-base">
                One of the most loved homes on Airbnb,
                <br />
                according to guests
              </p>
              <div className="flex gap-3 text-sm sm:text-base">
                {/* <span>Rating</span>
        <span>Review</span> */}
              </div>
            </div>

            {/* Host Info */}
            <div className="flex items-center gap-3 mt-6 mb-4">
              <LazyLoadImage
                className="w-10 h-10 rounded-full object-cover"
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHLZQkkzko60Lbyp5FQVS9RdEHpJjeAyQCng&s"
                alt="host"
              />
              <div className="flex flex-col">
                <span className="font-medium">{listing?.host?.name}</span>
                <span className="text-gray-400 text-sm">1 month hosting</span>
              </div>
            </div>
            <hr />

            {/* User Instructions */}
            <div className="border-b pb-6">
              <div className="flex items-start gap-2 mt-4">
                <LazyLoadImage
                  className="w-6 h-6 object-cover"
                  src="https://images.emojiterra.com/google/noto-emoji/unicode-16.0/color/512px/1f3c6.png"
                  alt="top"
                />
                <div>
                  <h3 className="font-medium">Top 5% homes</h3>
                  <p className="text-gray-400 text-sm">
                    This home is highly ranked based on rating, reviews and
                    reliability
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 mt-3">
                <GrFan className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Designed for staying cool</h3>
                  <p className="text-gray-400 text-sm">
                    Beat the heat with the A/C and ceiling fan.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 mt-3">
                <GrNotes className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">
                    Free cancellation before 14 January
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Get a full refund if you change your mind
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 border-b border-gray-300 pb-6">
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                {listing?.description}
              </p>
            </div>

            {/* Where you'll sleep */}
            <div className="mt-6 border-b border-gray-300 pb-6">
  <h3 className="text-xl font-semibold mb-4">Where you'll sleep</h3>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

    {[listing?.images?.[1], listing?.images?.[3]].map((img, i) => (
      <div key={i} className="flex flex-col">
        
        <div className="w-full h-[240px] rounded-xl overflow-hidden bg-gray-200">
          <LazyLoadImage
            src={img || listing?.images?.[0]}
            alt="room"
           
            className="w-full h-full object-cover object-center"
          />
        </div>

        <span className="mt-2 font-medium">
          {i === 0 ? "Bedroom" : "Living Area"}
        </span>

        <span className="text-gray-500 text-sm">
          {i === 0 ? "1 queen bed" : "1 sofa bed"}
        </span>
      </div>
    ))}

  </div>
</div>

            {/* Amenities */}
            <div className="mt-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">
                What this place offers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: GiCombinationLock, text: "Beach access" },
                  { icon: FaWifi, text: "Wifi" },
                  { icon: BsCarFront, text: "Free parking on permission" },
                  { icon: MdOutlineDoorSliding, text: "Lift" },
                  { icon: FaKitchenSet, text: "Kitchen" },
                  { icon: BsPersonWorkspace, text: "Dedicated Workspace" },
                  { icon: FaTv, text: "Tv" },
                  {
                    icon: GiCctvCamera,
                    text: "Exterior security cameras on property",
                  },
                  {
                    icon: ImCross,
                    text: "Carbon monoxide alarm",
                    strike: true,
                  },
                  { icon: MdSmokeFree, text: "Smoke alarm", strike: true },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3 pt-3">
                      <Icon className="w-6 h-6 flex-shrink-0" />
                      <span
                        className={
                          item.strike ? "line-through text-gray-500" : ""
                        }
                      >
                        {item.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Left Content */}
          <div className="lg:col-span-5">
            <div className="lg:sticky top-6 bg-white rounded-2xl shadow-xl p-6">
              {/* Price */}
              <div className="flex items-baseline gap-1 mb-4">
                <h2 className="text-2xl font-semibold">
                  ₹{listing.pricePerNight}
                </h2>
                <span className="text-gray-500">/ night</span>
              </div>

              {/* Booking Form */}
              <div className="border rounded-xl overflow-hidden">
                <div className="grid grid-cols-2 border-b">
                  <div className="p-3 border-r">
                    <label className="text-xs font-semibold uppercase">
                      Check-in
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full text-sm outline-none"
                    />
                  </div>
                  <div className="p-3">
                    <label className="text-xs font-semibold uppercase">
                      Check-out
                    </label>
                    <input
                      type="date"
                      min={checkIn || today}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="p-3">
                  <label className="text-xs font-semibold uppercase">
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full text-sm outline-none"
                  >
                    {[...Array(listing.maxGuests)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1} guest{i > 0 && "s"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleReservePayment}
                disabled={
                  bookingLoading ||
                  paymentLoading ||
                  checking ||
                  !available ||
                  !checkIn ||
                  !checkOut ||
                  nights === 0
                }
                className={`w-full mt-4 py-3 rounded-xl font-semibold transition
    ${
      bookingLoading || paymentLoading || checking
        ? "bg-gray-400 cursor-not-allowed"
        : !available
          ? "bg-gray-500 cursor-not-allowed"
          : "bg-rose-500 hover:bg-rose-600 text-white"
    }
  `}
              >
                {bookingLoading
                  ? "Creating booking..."
                  : paymentLoading
                    ? "Redirecting to payment..."
                    : checking
                      ? "Checking availability..."
                      : !available
                        ? "Not available for selected dates"
                        : "Reserve & Pay"}
              </button>

              <p className="text-center text-sm text-gray-500 mt-2">
                You won’t be charged yet
              </p>

              {nights > 0 && (
                <div className="mt-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="underline">
                      ₹{listing.pricePerNight} × {nights} nights
                    </span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline">Service fee</span>
                    <span>₹500</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Total before taxes</span>
                    <span>₹{totalPrice + 500}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= Things to know ================= */}
        <div className="mt-14">
          {/* ================= Map ================= */}
<div className="mt-14">
  <h2 className="text-2xl font-semibold mb-6">Where you'll be</h2>

  {listing?.location ? (
    <>
      <iframe
        title="map"
        width="100%"
        height="400"
        className="rounded-xl border"
        loading="lazy"
        allowFullScreen
        src={`https://www.google.com/maps?q=${encodeURIComponent(
          `${listing.location.address}, ${listing.location.city}, ${listing.location.state}, ${listing.location.country}`
        )}&z=15&output=embed`}
      ></iframe>

      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${listing.location.address}, ${listing.location.city}`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline mt-2 inline-block"
      >
        Get Directions
      </a>
    </>
  ) : (
    <p className="text-gray-500">Location not available</p>
  )}
</div>
          <h2 className="text-2xl font-semibold mb-6">Things to know</h2>

          <div className="grid md:grid-cols-3 gap-8 text-gray-700">
            {/* ===== Cancellation Policy ===== */}
            <div>
              <h3 className="font-semibold text-lg mb-3">
                Cancellation policy
              </h3>
              <p className="text-sm leading-relaxed">
                Free cancellation for{" "}
                <span className="font-medium">24 hours</span>.<br></br>
                After that, the reservation is non-refundable.
              </p>
              <button className="mt-2 text-sm font-medium underline hover:opacity-80">
                Learn more
              </button>
            </div>

            {/* ===== House Rules ===== */}
            <div>
              <h3 className="font-semibold text-lg mb-3">House rules</h3>
              <ul className="text-sm space-y-2">
                <li>🕑 Check-in: 2:00 PM – 11:00 PM</li>
                <li>🕚 Checkout before 11:00 AM</li>
                <li>👥 {listing.maxGuests} guests maximum</li>
              </ul>
              <button className="mt-2 text-sm font-medium underline hover:opacity-80">
                Learn more
              </button>
            </div>

            {/* ===== Safety & Property ===== */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Safety & property</h3>
              <ul className="text-sm space-y-2">
                <li>✔ Smoke alarm installed</li>
                <li>✔ Fire extinguisher available</li>
                <li>✔ Security camera on property (outside)</li>
              </ul>
              <button className="mt-2 text-sm font-medium underline hover:opacity-80">
                Learn more
              </button>
            </div>
          </div>
        </div>

        {/* ================= Reviews ================= */}
        <div className="mt-14 border-t pt-8">
          <h3 className="text-2xl font-semibold mb-6">Reviews</h3>
          {reviews.length > 0 ? (
            <div className="space-y-4">{reviewsList}</div>
          ) : (
            <p className="text-gray-500 text-sm">No reviews yet</p>
          )}

          {/* Comment Box */}
          {user && canReview ? (
            <Suspense fallback={<p>Loading reviews...</p>}>
              <CommentsPages
                listingId={listing._id}
                onReviewAdded={fetchReviews}
              />
            </Suspense>
          ) : (
            <p className="text-sm text-gray-500 mt-4">
              Only guests who stayed here can leave a review.
            </p>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Room;
