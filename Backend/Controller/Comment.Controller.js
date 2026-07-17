import client from "../Confige/Redis.js";
import Booking from "../Model/Booking.Model.js";
import CommentRating from "../Model/Comment.Model.js";

export const addReview = async(req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized. Please login.",
            });
        }

        const userId = req.user._id;
        const { listingId } = req.params;
        const { comment, rating } = req.body;

        if (!comment || !rating) {
            return res.status(400).json({
                message: "Comment and rating are required",
            });
        }

        const booking = await Booking.findOne({
            user: userId,
            listing: listingId,
            status: "completed",
            reviewed: false,
        });





        if (!booking) {
            return res.status(403).json({
                message: "You can review only after completing your booking",
            });
        }

        // if (new Date() < new Date(booking.checkOut)) {
        //     return res.status(403).json({
        //         message: "You can review only after checkout",
        //     });
        // }


        if (booking.reviewed) {
            return res.status(400).json({
                message: "You have already reviewed this booking",
            });
        }

        await CommentRating.create({
            user: userId,
            listing: listingId,
            comment,
            rating,
        });

        booking.reviewed = true;
        await booking.save();

        // ✅ Clear Redis cache
        await client.del(`reviews:${listingId}`);

        res.status(201).json({
            message: "Review added successfully",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getReviewsByListing = async(req, res) => {
    try {
        const listingId = req.params.id;
        const key = `reviews:${listingId}`;
        const cachedReviews = await client.get(key);

        if (cachedReviews) {
            return res.status(200).json({
                success: true,
                reviews: JSON.parse(cachedReviews),
                source: "cache",
            });
        }

        //fetch from dbg
        const reviews = await CommentRating.find({
            listing: listingId,
        }).populate("user", "name avatar");

        //cache the reviews for 30 minutes
        await client.setEx(key, 1800, JSON.stringify(reviews));

        res.status(200).json({ success: true, reviews, source: "db" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};