import React, { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdEye, IoIosEyeOff } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../Redux/authoSlice";
const API_URL = import.meta.env.VITE_API_URL;

function Login() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading,setLoading] = useState(false);
  const [showPassword,setShowPassword] = useState(false);

  const [form,setForm] = useState({
    email:"",
    password:""
  });

  const handleChange = useCallback((e)=>{
    const {name,value} = e.target;

    setForm(prev=>({
      ...prev,
      [name]:value
    }));

  },[]);

  const togglePassword = () => {
    setShowPassword(prev=>!prev);
  };

  const handleSubmit = useCallback(async(e)=>{

    e.preventDefault();

    try{

      setLoading(true);

      const res = await axios.post(
        `${API_URL}/api/users/login`,
        form,
        { withCredentials:true }
      );

      if(res.data.success){

        dispatch(loginSuccess(res.data.user));
        toast.success("Welcome back 👋");
        navigate("/");

      }

    }catch(error){

      toast.error(
        error?.response?.data?.message ||
        "Login failed"
      );

    }finally{

      setLoading(false);

    }

  },[form,dispatch,navigate]);

  const handleGoogleLogin = () => {
    window.open(`${API_URL}/api/users/google`, "_self");
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
            Welcome back! Please login
          </p>

        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Email */}

          <div>

            <label className="text-sm text-gray-600">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#fe395c] outline-none"
            />

          </div>

          {/* Password */}

          <div>

            <label className="text-sm text-gray-600">
              Password
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-[#fe395c] outline-none"
              />

              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword
                  ? <IoIosEyeOff size={20}/>
                  : <IoMdEye size={20}/>
                }
              </button>

            </div>

          </div>

          {/* Forgot password */}

          <div className="flex justify-end">

            <span
              onClick={()=>navigate("/forgot")}
              className="text-sm text-[#fe395c] cursor-pointer hover:underline"
            >
              Forgot password?
            </span>

          </div>

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#fe395c] text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
          >

            {loading
              ? "Logging in..."
              : "Login"
            }

          </button>

        </form>

        {/* Divider */}

        <div className="flex items-center my-6">

          <div className="flex-1 border-t"></div>

          <span className="px-3 text-gray-400 text-sm">
            OR
          </span>

          <div className="flex-1 border-t"></div>

        </div>

        {/* Google login */}

        <button
          onClick={handleGoogleLogin}
          className="w-full border border-gray-300 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition"
        >
              <FcGoogle size={20}/>
              Continue with Google
        </button>

        {/* Signup */}

        <p className="text-center text-sm mt-6">

          Don't have an account?{" "}

          <span
            onClick={()=>navigate("/signup")}
            className="text-[#fe395c] font-medium cursor-pointer"
          >
            Sign up
          </span>

        </p>

      </div>

    </div>
  );
}

export default memo(Login);
