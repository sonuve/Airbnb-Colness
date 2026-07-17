import React from "react";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";

function SearchComponenet({ item, savedPosts, handleSave }) {
    console.log(item)

  const isSaved = savedPosts.includes(item._id);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition duration-300 cursor-pointer group">

      {/* Image */}
      <div className="relative">

      <Link to={`/room/${item._id}`}>
        <img
          src={item.images?.[0] || "https://via.placeholder.com/400"}
          alt={item.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
        />
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={() => handleSave(item._id)}
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md"
        >
          {isSaved ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart className="text-gray-600" />
          )}
        </button>

        {/* Rating */}
        {/* <div className="absolute bottom-3 left-3 bg-white px-2 py-1 rounded flex items-center text-sm font-medium shadow">
          <FaStar className="text-yellow-500 mr-1" />
          {item.rating || "4.5"}
        </div> */}

      </div>

      {/* Info */}
      <div className="p-3">

        <h3 className="font-semibold text-gray-800 truncate">
          {item.title}
        </h3>

        {/* FIXED LOCATION */}
        <p className="text-gray-500 text-sm">
          {item.location?.city}, {item.location?.state}
        </p>

        <div className="flex justify-between items-center mt-2">

          <span className="font-bold text-lg text-gray-900">
            ₹{item.pricePerNight
            }
          </span>

          <span className="text-gray-500 text-sm">
            / night
          </span>

        </div>

      </div>
    </div>
  );
}

export default SearchComponenet;