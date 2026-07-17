import cashfree from "../Confige/Cashfree.js";
import Booking from "../Model/Booking.Model.js";
import Payment from "../Model/Payment.Model.js";
import client from "../Confige/Redis.js";
import { v4 as uuidv4 } from "uuid";
import { getIO } from "../Socketio/Socket.js";



//create payment order and save order details in db and return payment session id to frontend
export const createPaymentOrder = async(req, res) => {
    const { bookingId } = req.body;

    if (!bookingId) {
        return res.status(400).json({
            success: false,
            message: "Booking ID required",
        });
    }

    const lockKey = `payment-lock:${bookingId}`;

    try {
        // 🔒 Prevent multiple clicks
        const lock = await client.set(lockKey, "locked", {
            NX: true,
            EX: 120,
        });

        if (!lock) {
            return res.status(429).json({
                success: false,
                message: "Payment already processing. Please wait...",
            });
        }

        const booking = await Booking.findById(bookingId).populate("user");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // ✅ BLOCK INVALID STATUS
        if (["confirmed", "completed", "cancelled"].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: "Booking cannot be paid",
            });
        }

        const orderId = `order_${uuidv4()}`;

        const payment = await Payment.create({
            orderId,
            booking: booking._id,
            user: booking.user._id,
            amount: booking.totalPrice,
        });

        const response = await cashfree.post("/orders", {
            order_id: orderId,
            order_amount: booking.totalPrice,
            order_currency: "INR",
            customer_details: {
                customer_id: booking.user._id.toString(),
                customer_name: booking.user.name,
                customer_email: booking.user.email,
                customer_phone: "9999999999",
            },
            order_meta: {
                return_url: `http://localhost:5173/payment-success?order_id=${orderId}`,
            },
        });

        payment.paymentSessionId = response.data.payment_session_id;
        await payment.save();

        res.status(200).json({
            success: true,
            paymentSessionId: response.data.payment_session_id,
            orderId,
        });

    } catch (error) {
        console.error(error.response.data || error.message || error);
        res.status(500).json({
            success: false,
            message: "Payment creation failed",
        });
    } finally {
        await client.del(lockKey);
    }
};




//verify payment status from cashfree and update booking status and send notification to host
export const verifyPayment = async(req, res) => {
    const { orderId } = req.params;

    const verifyLockKey = `verify-lock:${orderId}`;
    const cacheKey = `payment-status:${orderId}`;

    try {
        // ⚡ 1️⃣ Check Redis cache first
        const cachedStatus = await client.get(cacheKey);

        if (cachedStatus === "PAID") {
            return res.json({ success: true });
        }

        // 🔒 2️⃣ Prevent duplicate verification
        const verifyLock = await client.set(verifyLockKey, "locked", {
            NX: true,
            EX: 60,
        });

        if (!verifyLock) {
            return res.json({
                success: true,
                message: "Already processing",
            });
        }

        const payment = await Payment.findOne({ orderId }).populate({
            path: "booking",
            populate: [
                { path: "user", select: "name" },
                { path: "listing", select: "title host" }
            ]
        });

        if (!payment) {
            return res.status(404).json({ success: false });
        }

        // ✅ RESTORE CACHE IF ALREADY PAID
        if (payment.status === "PAID") {
            await client.set(cacheKey, "PAID", { EX: 3600 });
            return res.json({ success: true });
        }

        // 💳 Verify with Cashfree
        const response = await cashfree.get(`/orders/${orderId}`);

        if (response.data.order_status !== "PAID") {
            return res.json({ success: false });
        }

        // ✅ Update DB
        payment.status = "PAID";
        await payment.save();

        // payment.booking.status = "confirmed";
        // await payment.booking.save();
        await Booking.findByIdAndUpdate(
            payment.booking._id, { status: "confirmed" }, { new: true }
        );

        // ⚡ Cache result
        await client.set(cacheKey, "PAID", { EX: 3600 });

        // 🔔 Emit socket notification
        const io = getIO();
        const hostId = payment.booking.listing.host.toString();

        io.to(hostId).emit("booking-notification", {
            bookingId: payment.booking._id,
            listingId: payment.booking.listing._id,
            guestName: payment.booking.user.name,
            listingTitle: payment.booking.listing.title,
            checkIn: payment.booking.checkIn,
            checkOut: payment.booking.checkOut,
        });

        res.json({ success: true });

    } catch (error) {
        console.error(error.response.data || error.message || error);
        res.status(500).json({ success: false });
    } finally {
        await client.del(verifyLockKey);
    }
};