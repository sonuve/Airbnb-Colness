import axios from "axios";
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function Payments() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verify = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const orderId = params.get("order_id");

        if (orderId) {
          await axios.get(
            `${API_URL}/api/payment/verify/${orderId}`,
            { withCredentials: true }
          );
        }

        navigate("/hotel/booking");

      } catch (error) {
        console.log(error);
        navigate("/hotel/booking");
      }
    };

    verify();
  }, [location.search, navigate]);

  return (
    <div className="text-center mt-20">
      <h1 className="text-2xl font-semibold">Payment Successful!</h1>
      <p className="text-gray-500 mt-2">Redirecting...</p>
    </div>
  );
}

export default Payments;