import express from 'express'
import { addReview, getReviewsByListing } from '../Controller/Comment.Controller.js';
import { authenticateUser } from '../MiddleWare/userAutho.js';
const router = express.Router();

router.post("/comment/:listingId", authenticateUser, addReview);
router.get("/comments/:id", getReviewsByListing);

export default router;