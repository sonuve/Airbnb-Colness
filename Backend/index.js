import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Cashfree } from "cashfree-pg";

import connectDB from "./Utile/DB.js";
import userRouter from "./Router/User.router.js";
import listingRouter from "./Router/Listing.Router.js";
import bookingRouter from "./Router/Booking.Router.js";
import paymentRouter from "./Router/Payment.Router.js";
import reviewRouter from "./Router/Comment.Router.js";
import { initSocket } from "./Socketio/Socket.js";
import { timestamps } from "./Cron/cronJobs.js";
import { bookingClean } from "./Cron/bookingCleanup.cron.js";
import apiLimite from "./MiddleWare/rateLimites.js";
import passport from "passport";
import "./Confige/passport.js";

dotenv.config();

/* Cashfree config */
Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.Environment = "TEST";

const app = express();
app.use(passport.initialize());
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
app.use(cookieParser());
app.use(express.static("public")); // Serve static files from the "public" directory

/* Middleware */

app.use(cors({
    origin: [
        "https://airbnb-colness-frontend.onrender.com",
    ],

app.use(
  cors({
    origin: ["https://airbnb-colness-frontend.onrender.com"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

/* Apply rate limit only in production */
if (process.env.NODE_ENV === "production") {

    app.use("/api", apiLimite);

  app.use("/api", apiLimite);
}

/* Routes */
app.use("/api/users", userRouter);
app.use("/api/listing", listingRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/review", reviewRouter);

/* Initialize Socket */
initSocket(server);

/* Start Server */
server.listen(PORT, async() => {
    console.log(`🚀 Server running on port ${PORT}`);
    await connectDB();
    timestamps;
    bookingClean;


server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await connectDB();
  timestamps;
  bookingClean;
});
