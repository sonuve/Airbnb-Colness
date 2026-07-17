import express from "express";
import { createPaymentOrder, verifyPayment } from "../Controller/Payment.Controller.js";
import { authenticateUser } from '../MiddleWare/userAutho.js';

const router = express.Router();

router.post("/create", authenticateUser, createPaymentOrder);
router.get("/verify/:orderId", verifyPayment);

export default router;