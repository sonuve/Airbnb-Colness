import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleForgot = async () => {
    try {
      setLoading(true);
  
      await axios.post(
        `${API_URL}/api/users/forgot-password`,
        { email }
      );
  
      toast.success("OTP sent to your email 📩");
  
      // ✅ REDIRECT TO RESET PAGE
      navigate("/reset");
  
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-gray-100 px-4">

      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">

        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#fe395c]">
            Airbnb
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Reset your password
          </p>
        </div>

        {/* Info Text */}
        <p className="text-sm text-gray-500 mb-4 text-center">
          Enter your email and we’ll send you a verification code.
        </p>

        {/* Input */}
        <div>
          <label className="text-sm text-gray-600">
            Email Address
          </label>

          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#fe395c] outline-none"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleForgot}
          disabled={loading}
          className="w-full mt-5 bg-[#fe395c] text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>

      </div>
    </div>
  );
}

export default ForgotPassword;
