import axios from "axios";
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setBooking } from "../../Redux/Booking";

const API_URL = import.meta.env.VITE_API_URL;

function Payments() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const verify = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const orderId = params.get("order_id");

        if (!orderId) {
          navigate("/hotel/booking");
          return;
        }

        // 1️⃣ Verify payment
        await axios.get(
          `${API_URL}/api/payment/verify/${orderId}`,
          { withCredentials: true }
        );

        // 2️⃣ Fetch updated bookings
        const bookingRes = await axios.get(
          `${API_URL}/api/booking/my`,
          { withCredentials: true }
        );

        // 3️⃣ Update Redux BEFORE redirect
        dispatch(setBooking(bookingRes.data.bookings));

        // 4️⃣ Now redirect
        navigate("/hotel/booking");

      } catch (error) {
        console.log("Payment error:", error);
        navigate("/hotel/booking");
      }
    };

    verify();
  }, [location.search, navigate, dispatch]);

  return (
    <div className="text-center mt-20">
      <h1 className="text-2xl font-semibold">Payment Successful!</h1>
      <p className="text-gray-500 mt-2">Redirecting to your bookings...</p>
    </div>
  );
}

export default Payments;