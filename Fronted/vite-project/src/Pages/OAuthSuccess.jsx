import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../Redux/authoSlice";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function OAuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(false);

  useEffect(() => {
    const tokenFromUrl = params.get("token");

    if (!tokenFromUrl) {
      navigate("/login");
      return;
    }

    const fetchProfile = async (useBearerToken = false) => {
      try {
        const headers = useBearerToken
          ? { Authorization: `Bearer ${tokenFromUrl}` }
          : {};

        const response = await axios.get(`${API_URL}/api/users/profile`, {
          withCredentials: true,
          headers,
        });

        const userData = response.data.user || response.data;
        if (userData?._id) {
          dispatch(loginSuccess(userData));
          navigate("/");
        } else {
          throw new Error("No user data");
        }
      } catch (err) {
        if (!useBearerToken) {
          fetchProfile(true); // retry with Bearer token
        } else {
          setError(true);
          setTimeout(() => navigate("/login"), 2000);
        }
      }
    };

    setTimeout(() => fetchProfile(false), 500);
  }, [dispatch, navigate, params]);

  if (error) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-red-600">Authentication failed</h2>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fe395c] mx-auto"></div>
        <h2 className="mt-4 text-gray-600">Logging you in...</h2>
      </div>
    </div>
  );
}

export default OAuthSuccess;