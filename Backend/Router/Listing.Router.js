import express from 'express';
import { authenticateUser } from '../MiddleWare/userAutho.js';
import { createListing, deleteListing, getAllListings, getCityWiseListings, getUserListings, hotelSearch, listingCategory, updateListings } from '../Controller/Listing.Controller.js';
import upload from '../Utile/Multer.js';

const router = express.Router();

router.post("/add/listing", authenticateUser, upload.array("images"), createListing);
router.get("/all/listings", getAllListings);
router.delete("/delete/:id", authenticateUser, deleteListing);
router.get("/category/:category", listingCategory);
router.get("/search", hotelSearch);
router.get("/city", getCityWiseListings);
router.get("/my/listings", authenticateUser, getUserListings)
router.put("/update/listing/:id", authenticateUser, upload.array("images"), updateListings);

export default router;