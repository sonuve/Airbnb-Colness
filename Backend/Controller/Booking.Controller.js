import client from "../Confige/Redis.js";
import Booking from "../Model/Booking.Model.js";
import Listing from "../Model/Listing.Model.js";

export const bookRoom = async(req, res) => {
    try {
        const { listingId } = req.params;
        const { checkIn, checkOut, guests, totalPrice } = req.body;

        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found"
            });
        }

        // ✅ 1️⃣ IMPORTANT: Check for conflict BEFORE creating booking
        const conflict = await Booking.findOne({
            listing: listingId,
            status: { $in: ["reserved", "confirmed"] },
            checkIn: { $lt: new Date(checkOut) },
            checkOut: { $gt: new Date(checkIn) },
        });

        if (conflict) {
            return res.status(400).json({
                success: false,
                message: "Room already booked for selected dates",
            });
        }

        // ✅ 2️⃣ Now create booking safely
        const booking = await Booking.create({
            user: req.user._id,
            listing: listingId,
            checkIn,
            checkOut,
            guests,
            totalPrice,
            status: "reserved",
        });

        await client.del(`availability:${listingId}:${checkIn}:${checkOut}`);

        const populatedBooking = await Booking.findById(booking._id)
            .populate("listing")
            .populate("user", "name email")
            .lean();

        return res.status(201).json({
            success: true,
            message: "Room booked successfully",
            booking: populatedBooking,
            bookingId: populatedBooking._id,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


export const checkAvalibility = async(req, res) => {
    try {
        const { listingId, checkIn, checkOut } = req.query;

        const key = `availability:${listingId}:${checkIn}:${checkOut}`;

        const cachedData = await client.get(key);

        if (cachedData) {
            return res.status(200).json(JSON.parse(cachedData));
        }


        const conflict = await Booking.findOne({
            listing: listingId,
            status: { $in: ["reserved", "confirmed"] },
            checkIn: { $lt: new Date(checkOut) },
            checkOut: { $gt: new Date(checkIn) },
        }).lean();

        await client.setEx(key, 300, JSON.stringify({ available: !conflict }));

        return res.status(200).json({
            available: !conflict,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

export const getMyBookings = async(req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate("listing")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            bookings,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const cancelBooking = async(req, res) => {
    try {
        const { bookingId } = req.params;

        // 1️⃣ Find the booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res
                .status(404)
                .json({ success: false, message: "Booking not found" });
        }

        // 2️⃣ Check ownership
        if (booking.user.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({
                    success: false,
                    message: "Not authorized to delete this booking",
                });
        }

        // 3️⃣ Optional: Prevent deletion if already completed
        if (booking.status === "completed") {
            return res
                .status(400)
                .json({ success: false, message: "Cannot delete a completed booking" });
        }

        // 4️⃣ Delete the booking
        await booking.deleteOne();

        //delete booking  in redis
        await client.del(`booking:${bookingId}`);


        return res.status(200).json({
            success: true,
            message: "Booking deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const deleteBookingHistory = async(req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }

    if (!["completed", "cancelled"].includes(booking.status)) {
        return res.status(400).json({
            message: "Only completed or cancelled bookings can be removed",
        });
    }

    booking.deletedByUser = true;
    await booking.save();

    res.json({ message: "Booking removed from history" });
};

//show host booking details about userd
export const getBookingById = async(req, res) => {
    try {
        const { id } = req.params;
        const key = `booking:${id}`;

        const cacheData = await client.get(key);

        if (cacheData) {
            return res.json(JSON.parse(cacheData));
        }

        const booking = await Booking.findById(id)
            .populate("user", "name email phone")
            .populate("listing")
            .lean();

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // 🔥 Fix: check listing
        if (!booking.listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found for this booking"
            });
        }

        const result = {
            success: true,
            booking: {
                _id: booking._id,
                listingTitle: booking.listing.title || "Listing removed",
                location: booking.listing.location || {},
                images: booking.listing.images || [],
                guestName: booking.user.name,
                guestEmail: booking.user.email,
                guestPhone: booking.user.phone,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                totalPrice: booking.totalPrice,
                paymentStatus: booking.status
            }
        };

        await client.setEx(key, 300, JSON.stringify(result));

        return res.json(result);

    } catch (error) {
        console.error(error); // 🔥 important for debugging
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

export const deleteBooking = async(req, res) => {
    try {

        const { id } = req.params;

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Only owner can delete booking
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });
        }

        await Booking.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Booking deleted successfully",
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error",
        });

    }
};