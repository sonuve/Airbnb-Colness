import mongoose from "mongoose";
const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    pricePerNight: {
        type: Number,
        required: true,
    },
    location: {
        address: String,
        city: String,
        state: String,
        country: String,
    },
    images: {
        type: [String],
        required: true,
    },
    category: {
        type: String,
        enum: ["Villa", "Room", "PG", "Flat", "Farm House", "Cabin"],
        required: true,
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    maxGuests: {
        type: Number,
        required: true,
    },
    washrooms: {
        type: Number,
        required: true,
    },
    bedrooms: {
        type: Number,
        required: true,
    },
    beds: {
        type: Number,
        required: true,
    },
    bookedDates: [{
        checkIn: Date,
        checkOut: Date,
    }, ],

    isAvailable: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;