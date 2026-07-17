import React, { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { IoMdEye, IoIosEyeOff } from "react-icons/io";
const API_URL = import.meta.env.VITE_API_URL;
function Signup() {

  const navigate = useNavigate();

  const [loading,setLoading] = useState(false);
  const [showPassword,setShowPassword] = useState(false);

  const [form,setForm] = useState({
    name:"",
    email:"",
    password:""
  });

  /* ---------- INPUT CHANGE ---------- */

  const handleChange = useCallback((e)=>{

    const {name,value} = e.target;

    setForm(prev=>({
      ...prev,
      [name]:value
    }));

  },[]);

  /* ---------- TOGGLE PASSWORD ---------- */

  const togglePassword = useCallback(()=>{
    setShowPassword(prev=>!prev);
  },[]);

  /* ---------- SUBMIT ---------- */

  const handleSubmit = useCallback(async(e)=>{

    e.preventDefault();

    if(loading) return;

    try{

      setLoading(true);

      const res = await axios.post(
        `${API_URL}/api/users/signup`,
        form,
        {
          headers:{ "Content-Type":"application/json" },
          withCredentials:true
        }
      );

      if(res.data.success){

        toast.success("Signup successful 🎉");
        navigate("/login");

      }

    }catch(error){

      const message =
        error?.response?.data?.message ||
        "Server not responding";

      toast.error(message);

    }finally{

      setLoading(false);

    }

  },[form,loading,navigate]);

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-gray-100 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

        {/* HEADER */}

        <div className="text-center mb-6">

          <h1 className="text-3xl font-bold text-[#fe395c]">
            StayFinder
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Create your account
          </p>

        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NAME */}

          <div>

            <label className="text-sm text-gray-600">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#fe395c] outline-none"
            />

          </div>

          {/* EMAIL */}

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

          {/* PASSWORD */}

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
                placeholder="Create password"
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

          {/* TERMS */}

          <p className="text-xs text-gray-500">

            By continuing, you agree to our{" "}
            <span className="text-[#fe395c] cursor-pointer">
              Terms
            </span>{" "}
            and{" "}
            <span className="text-[#fe395c] cursor-pointer">
              Privacy Policy
            </span>.

          </p>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#fe395c] text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
          >

            {loading
              ? "Creating account..."
              : "Sign up"
            }

          </button>

        </form>

        {/* LOGIN */}

        <p className="text-center text-sm mt-6">

          Already have an account?{" "}

          <span
            onClick={()=>navigate("/login")}
            className="text-[#fe395c] font-medium cursor-pointer"
          >
            Login
          </span>

        </p>

      </div>

    </div>

  );

}

export default memo(Signup);
