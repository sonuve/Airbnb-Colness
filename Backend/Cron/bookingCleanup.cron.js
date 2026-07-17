import cron from "node-cron";
import Booking from "../Model/Booking.Model.js";

console.log("🕒 Booking cleanup cron started");

export const bookingClean = cron.schedule("*/5 * * * *", async() => {
    try {
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

        const result = await Booking.deleteMany({
            status: "reserved",
            createdAt: { $lt: fifteenMinutesAgo },
        });

        console.log(`🗑 ${result.deletedCount} expired reservations removed`);
    } catch (error) {
        console.error("Cleanup cron error:", error);
    }
});