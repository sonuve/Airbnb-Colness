import express from 'express'
import { authenticateUser } from '../MiddleWare/userAutho.js';
import { bookRoom, cancelBooking, checkAvalibility, deleteBooking, deleteBookingHistory, getBookingById, getMyBookings } from '../Controller/Booking.Controller.js';

const router = express.Router();

router.post("/reserve/:listingId", authenticateUser, bookRoom);
router.get("/check", checkAvalibility);
router.get("/my", authenticateUser, getMyBookings);
router.put("/:bookingId", authenticateUser, cancelBooking);
router.delete("/delete/:id", authenticateUser, deleteBooking);
router.get("/bookings/:id", authenticateUser, getBookingById);



export default router;