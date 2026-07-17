import cron from "node-cron";
import client from "../Confige/Redis.js"; // ✅ import redis
import { completeExpiredBookings } from "../Utile/CompleteBooking.js";

console.log("✅ Booking completion cron started");

export const timestamps = cron.schedule(
    "2 1 * * *", // run daily 
    async() => {
        try {
            console.log(`🕒 Cron triggered at ${new Date().toISOString()}`);

            //  Try to acquire lock
            const lock = await client.set("booking-cron-lock", "locked", {
                NX: true, // Only set if not exists
                EX: 300, // Auto expire in 5 minutes
            });

            // If lock not acquired → another instance is running
            if (!lock) {
                console.log("⚠ Another instance is already running this cron.");
                return;
            }

            console.log("🔒 Lock acquired. Running job...");


            try {
                await completeExpiredBookings();
            } finally {
                await client.del("booking-cron-lock");
            }

            console.log(" Booking cron finished successfully");

        } catch (err) {
            console.error(" Cron error:", err);
        }
    }, {
        timezone: "Asia/Kolkata",
    }
);