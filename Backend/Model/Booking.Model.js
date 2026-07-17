// models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
        required: true,
    },
    checkIn: {
        type: Date,
        required: true,
    },
    checkOut: {
        type: Date,
        required: true,
    },
    guests: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    // ✅ UPDATED STATUS FLOW
    status: {
        type: String,
        enum: [
            "reserved", // booking created, payment not done
            "confirmed", // payment verified ✅
            "completed", // stay finished (cron job)
            "cancelled", // cancelled by user/admin
        ],
        default: "reserved",
    },
    // ⭐ Needed for review permission
    reviewed: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;