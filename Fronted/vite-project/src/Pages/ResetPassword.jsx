import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { IoMdEye, IoIosEyeOff } from "react-icons/io";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;
function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  const handleReset = async () => {
    try {
      setLoading(true);
  
      await axios.post(
        `${API_URL}/api/users/reset-password`,
        form
      );
  
      toast.success("Password reset successful 🎉");
  
      // ✅ LOGIN PAGE
      navigate("/login");
  
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
            Create a new password
          </p>
        </div>

        {/* Info */}
        <p className="text-sm text-gray-500 mb-4 text-center">
          Enter the OTP sent to your email and set a new password.
        </p>

        {/* Email */}
        <div className="mb-3">
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            name="email"
            placeholder="example@email.com"
            value={form.email}
            onChange={handleChange}
            className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#fe395c] outline-none"
          />
        </div>

        {/* OTP */}
        <div className="mb-3">
          <label className="text-sm text-gray-600">OTP</label>
          <input
            type="text"
            name="otp"
            placeholder="Enter 6-digit OTP"
            value={form.otp}
            onChange={handleChange}
            className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#fe395c] outline-none"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="text-sm text-gray-600">New Password</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter new password"
              value={form.password}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-[#fe395c] outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? (
                <IoIosEyeOff size={20} />
              ) : (
                <IoMdEye size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-[#fe395c] text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

      </div>
    </div>
  );
}

export default ResetPassword;
