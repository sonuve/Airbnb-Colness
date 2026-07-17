import React from "react";
import { Route, Routes } from "react-router-dom";
const Login=React.lazy(()=>import("./Pages/Login"))
const Signup=React.lazy(()=>import("./Pages/Signup"))
const Home=React.lazy(()=>import("./Pages/Home"))
const ListingCreate=React.lazy(()=>import("./Pages/ListingCreate"))
const Room =React.lazy(()=>import("./Components/Room"))
const WithList=React.lazy(()=>import("./Pages/WithList"))
const SearchPages=React.lazy(()=>import("./Components/SearchPages"))
const Booking=React.lazy(()=>import("./Pages/Booking"))
const Payments=React.lazy(()=>import("./Pages/Payments"))
const MyListings=React.lazy(()=>import("./Pages/MyListings"))
const EditListings=React.lazy(()=>import("./Pages/EditListings"))
const ProtectedRoute=React.lazy(()=>import("./Components/ProtectedRoute"))
import { useSelector } from "react-redux";
import { useSocket } from "./Socket/SocketManager";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import OAuthSuccess from "./Pages/OAuthSuccess";
const HostBookingDetails=React.lazy(()=>import("./Pages/HostBookingDetails"))

function App() {

   const user = useSelector((state) => state.auth.user); // or however you store user
  useSocket(user?.id);
  
  
  return (
    <Routes>
      {/* 🌍 Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/room/:id" element={<Room />} />
      <Route path="/search/hotel" element={<SearchPages />} />
      <Route path="/payment-success" element={<Payments />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/reset" element={<ResetPassword />} />
      
      

      {/* 🔐 Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/create-listing" element={<ListingCreate />} />
        <Route path="/my/listings" element={<MyListings />} />
        <Route path="/edit-listing/:id" element={<EditListings />} />
        <Route path="/hotel/booking" element={<Booking />} />
        <Route path="/save" element={<WithList />} />
        <Route path="/host/booking/:id" element={<HostBookingDetails/>} />

      </Route>
    </Routes>
  );
}

export default App;
