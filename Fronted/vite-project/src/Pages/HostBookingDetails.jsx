import React, {
  useEffect,
  useState,
  useCallback,
  Suspense
} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { LazyLoadImage } from "react-lazy-load-image-component";
const API_URL = import.meta.env.VITE_API_URL;

const Nav2 = React.lazy(() => import("../Components/Nav2.jsx"));

function HostBookingDetails() {

  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [loading, setLoading] = useState(true);

  /* -------- FETCH BOOKING -------- */
  const fetchBooking = useCallback(async () => {

    try {

      const res = await axios.get(
        `${API_URL}/api/booking/bookings/${id}`,
        { withCredentials: true }
      );

      if (res.data.success) {

        const data = res.data.booking;

        setBooking(data);

        if (data.images?.length) {
          setMainImage(data.images[0]);
        }

      }

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  /* -------- LOADING STATE -------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading booking details...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-500">
        Booking not found
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={<div>Loading Navbar...</div>}>
        <Nav2 />
      </Suspense>

      <div className="max-w-6xl mx-auto p-6 space-y-8">

        {/* TITLE */}
        <div>
          <h1 className="text-3xl font-bold">{booking.listingTitle}</h1>

          <p>
            📍 {booking.location?.address}, {booking.location?.city},{" "}
            {booking.location?.state}, {booking.location?.country}
          </p>

          <p className="text-sm text-gray-400">
            Booking ID: {booking._id}
          </p>
        </div>

        {/* IMAGE GALLERY */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

          {/* MAIN IMAGE */}
          <div className="md:col-span-2">

            {mainImage ? (

              <LazyLoadImage
                src={mainImage}
                alt="Hotel"
                className="w-full h-[450px] object-cover rounded-2xl shadow-md"
              />

            ) : (

              <div className="h-[450px] flex items-center justify-center bg-gray-100 rounded-2xl">
                No Images Available
              </div>

            )}

          </div>

          {/* THUMBNAILS */}
          <div className="grid grid-cols-2 gap-3 md:col-span-2">

            {booking.images?.slice(1, 5).map((img, index) => (

              <LazyLoadImage
                key={index}
                src={img}
                alt="Hotel"
                onClick={() => setMainImage(img)}
                className="h-[220px] w-full object-cover rounded-2xl cursor-pointer hover:opacity-80 transition"
              />

            ))}

          </div>

        </div>

        {/* DETAILS */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* GUEST INFO */}
          <div className="bg-white shadow-lg rounded-2xl p-6">

            <h2 className="text-xl font-semibold mb-4">
              Guest Info
            </h2>

            <p>Name: {booking.guestName}</p>
            <p>Email: {booking.guestEmail}</p>
            <p>Phone: {booking.guestPhone}</p>

          </div>

          {/* BOOKING INFO */}
          <div className="bg-white shadow-lg rounded-2xl p-6">

            <h2 className="text-xl font-semibold mb-4">
              Booking Info
            </h2>

            <p>
              Check-in:{" "}
              {new Date(booking.checkIn).toDateString()}
            </p>

            <p>
              Check-out:{" "}
              {new Date(booking.checkOut).toDateString()}
            </p>

            <p className="text-green-600 font-bold">
              ₹{booking.totalPrice}
            </p>

            <p>Status: {booking.paymentStatus}</p>

          </div>

        </div>

      </div>
    </>
  );
}

export default React.memo(HostBookingDetails);
