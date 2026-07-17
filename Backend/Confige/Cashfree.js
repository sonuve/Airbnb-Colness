import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const cashfree = axios.create({
    baseURL: "https://sandbox.cashfree.com/pg",
    headers: {
        "Content-Type": "application/json",
        "x-api-version": "2022-09-01",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
    },
});

export default cashfree;