import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const client = createClient({
    url: process.env.REDIS_URL //use env variable
});

// Events
client.on("connect", () => {
    console.log("✅ Redis Connected");
});

client.on("error", (err) => {
    console.log("❌ Redis Error", err);
});

// Connect safely
(async() => {
    try {
        await client.connect();
    } catch (error) {
        console.log("Redis connection failed:", error.message);
    }
})();

export default client;