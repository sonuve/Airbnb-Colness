import React, {
  useEffect,
  useCallback,
  useMemo,
  useState,
  Suspense,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setBooking } from "../../Redux/Booking";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { LazyLoadImage } from "react-lazy-load-image-component";

const API_URL = import.meta.env.VITE_API_URL;
const Nav2 = React.lazy(() => import("../Components/Nav2.jsx"));

function Booking() {
  const dispatch = useDispatch();

  const bookedHotel = useSelector((state) => state.Booking.Bookings);

  // ✅ SAFE DATA (prevents crash)
  const safeBookings = useMemo(() => {
    if (!Array.isArray(bookedHotel)) return [];
    return bookedHotel.filter(
      (b) => b && b.listing && b.checkIn && b.checkOut
    );
  }, [bookedHotel]);

  const [openMenuId, setOpenMenuId] = useState(null);

  // ================= FETCH BOOKINGS =================
  const fetchMyBookings = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/booking/my`, {
        withCredentials: true,
      });

      if (res.data?.success) {
        dispatch(setBooking(res.data.bookings || []));
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch bookings");
    }
  }, [dispatch]);

  // ================= CANCEL BOOKING =================
  const cancelBooking = useCallback(
    async (bookingId) => {
      try {
        await axios.put(
          `${API_URL}/api/booking/${bookingId}`,
          {},
          { withCredentials: true }
        );

        toast.success("Booking cancelled");
        fetchMyBookings();
      } catch (error) {
        toast.error(error.response?.data?.message || "Cancel failed");
      }
    },
    [fetchMyBookings]
  );

  // ================= DELETE BOOKING =================
  const deleteBooking = useCallback(
    async (bookingId) => {
      const ok = window.confirm("Delete this booking?");
      if (!ok) return;

      try {
        const res = await axios.delete(
          `${API_URL}/api/booking/delete/${bookingId}`,
          { withCredentials: true }
        );

        if (res.data?.success) {
          toast.success("Booking deleted");
          fetchMyBookings();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    },
    [fetchMyBookings]
  );

  // ================= INITIAL LOAD =================
  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  // ================= UI =================
  if (safeBookings.length === 0) {
    return (
      <>
        <Suspense fallback={<div>Loading...</div>}>
          <Nav2 />
        </Suspense>

        <div className="min-h-screen flex items-center justify-center text-gray-500">
          No bookings found
        </div>
      </>
    );
  }

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Nav2 />
      </Suspense>

      <div className="min-h-screen bg-gray-100 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Your Bookings
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {safeBookings.map((booking) => {
              const showCancel =
                booking.status === "reserved" || booking.status === "paid";

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden relative"
                >
                  {/* IMAGE */}
                  <Link to={`/room/${booking.listing._id}`}>
                    <div className="w-full aspect-[4/3] overflow-hidden">
                      <LazyLoadImage
                        src={
                          booking.listing?.images?.[0] ||
                          "/default-room.jpg"
                        }
                        alt={booking.listing?.title || "room"}
                        className="w-full h-full object-cover hover:scale-105 transition"
                        onError={(e) =>
                          (e.target.src = "/default-room.jpg")
                        }
                      />
                    </div>

                    <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 text-xs rounded">
                      {booking.status}
                    </div>
                  </Link>

                  {/* MENU */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === booking._id
                            ? null
                            : booking._id
                        )
                      }
                    >
                      ⋮
                    </button>

                    {openMenuId === booking._id && (
                      <div className="absolute right-0 mt-2 bg-white border rounded shadow w-32">
                        {showCancel && (
                          <button
                            onClick={() => {
                              cancelBooking(booking._id);
                              setOpenMenuId(null);
                            }}
                            className="block w-full text-left px-3 py-2 hover:bg-red-100"
                          >
                            Cancel
                          </button>
                        )}

                        <button
                          onClick={() => {
                            deleteBooking(booking._id);
                            setOpenMenuId(null);
                          }}
                          className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="p-5">
                    <h2 className="font-semibold text-lg">
                      {booking.listing?.title}
                    </h2>

                    <p className="text-gray-500 text-sm">
                      📍 {booking.listing?.location?.city}
                    </p>

                    <p className="text-sm mt-2">
                      Check-in:{" "}
                      {new Date(booking.checkIn).toLocaleDateString()}
                    </p>

                    <p className="text-sm">
                      Check-out:{" "}
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </p>

                    <p className="text-rose-500 font-bold mt-2">
                      ₹{booking.totalPrice}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default React.memo(Booking);