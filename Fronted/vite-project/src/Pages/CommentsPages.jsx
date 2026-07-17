import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
const API_URL = import.meta.env.VITE_API_URL;
function CommentsPages({ listingId, onReviewAdded }) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  const submitReview = async () => {
    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_URL}/api/review/comment/${listingId}`,
        { comment, rating },
        { withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Review added successfully");

      setComment("");
      setRating(5);

      onReviewAdded?.(); // refresh reviews
    } catch (err) {
      toast.error(
        err.response?.data?.message || "You are not allowed to review"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-xl mt-6">
      <h3 className="text-lg font-semibold mb-3">Leave a review</h3>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        rows={4}
        className="w-full border rounded-lg p-3 mb-3 resize-none"
      />

      <div className="flex items-center gap-3">
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border rounded-lg p-2"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} ⭐
            </option>
          ))}
        </select>

        <button
          onClick={submitReview}
          disabled={loading || !comment.trim()}
          className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-lg disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}

export default CommentsPages;
