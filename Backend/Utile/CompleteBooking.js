import Booking from "../Model/Booking.Model.js";

export const completeExpiredBookings = async() => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // start of today

        const result = await Booking.updateMany({
            status: "confirmed",
            checkOut: { $lt: today }
        }, {
            $set: { status: "completed" }
        });

        console.log("Completed bookings:", result.modifiedCount);

    } catch (error) {
        console.error("Error updating bookings:", error);
    }
};