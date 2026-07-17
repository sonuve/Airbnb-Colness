import client from "../Confige/Redis.js";
import Listing from "../Model/Listing.Model.js";

// function to clear cache data (SAFE VERSION)
export const clearListingCache = async() => {
    try {
        const keys = [];

        for await (const key of client.scanIterator({
            MATCH: "listings:*",
            COUNT: 100,
        })) {
            keys.push(key);
        }

        if (keys.length > 0) {
            await client.del(...keys); // ✅ spread operator
            console.log(`🧹 Cleared ${keys.length} listing cache keys`);
        } else {
            console.log("⚡ No listing cache found");
        }

    } catch (error) {
        console.error("Redis clear error:", error.message);
    }
};






export const createListing = async(req, res) => {
    try {
        const {
            title,
            description,
            pricePerNight,
            category,
            maxGuests,
            address,
            city,
            state,
            country,
            washrooms,
            bedrooms,
            beds,
        } = req.body;

        // Check images
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one image is required",
            });
        }

        const images = req.files.map((file) => file.path);



        const newListing = await Listing.create({
            title,
            description,
            pricePerNight,
            location: {
                address,
                city,
                state,
                country,
            },
            images,
            category,
            maxGuests,
            washrooms,
            bedrooms,
            beds,
            host: req.user._id,
        });

        //after 30 min delete cache data
        await clearListingCache();



        return res.status(201).json({
            success: true,
            message: "Listing created successfully.",
            listing: newListing,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server Error. Unable to create listing.",
        });
    }
};


export const getAllListings = async(req, res) => {
    try {
        const cacheKey = "listings:all";

        const cacheData = await client.get(cacheKey);

        if (cacheData) {
            return res.status(200).json({
                success: true,
                listings: JSON.parse(cacheData),
            });
        }

        // ✅ FIXED HERE
        const listings = await Listing.find().populate("host").lean();

        await client.setEx(cacheKey, 1800, JSON.stringify(listings));

        return res.status(200).json({
            success: true,
            listings,
        });

    } catch (error) {
        console.error("GET ALL ERROR 👉", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



export const deleteListing = async(req, res) => {
    try {
        const { id } = req.params;

        // 1️⃣ Find listing
        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found",
            });
        }

        // 2️⃣ Ownership check (ONLY HOST CAN DELETE)
        if (listing.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized",
            });
        }

        // 3️⃣ Delete listing
        await listing.deleteOne();

        // 🧹 Clear cache
        await clearListingCache();


        return res.status(200).json({
            success: true,
            message: "Listing deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error. Unable to delete listing",
            error: error.message,
        });
    }
};


export const listingCategory = async(req, res) => {
    try {
        const { category } = req.params;

        const cacheKey = `listings:category:${category}`;

        const cacheData = await client.get(cacheKey);
        if (cacheData) {
            return res.status(200).json({
                success: true,
                source: "redis cache",
                listings: JSON.parse(cacheData),
            });
        }

        let filter = { isAvailable: true };
        if (category && category !== "all") {
            filter.category = category;
        }

        const listings = await Listing.find(filter).lean();

        await client.setEx(cacheKey, 1800, JSON.stringify(listings));

        return res.status(200).json({
            success: true,
            listings,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error. Unable to category fetch",
        });
    }
};


export const hotelSearch = async(req, res) => {
    try {


        const { title, pricePerNight } = req.query;

        // Create a unique cache key based on search parameters
        const cacheKey = `listings:search:${(title || "all").trim().toLowerCase()}:${pricePerNight || "any"}`;

        // Check Redis cache first
        const cacheData = await client.get(cacheKey);
        if (cacheData) {
            return res.json({
                success: true,
                source: "redis cache",
                listings: JSON.parse(cacheData)
            });
        }

        let query = { isAvailable: true };

        if (title) {
            query.$or = [
                { title: { $regex: title, $options: "i" } },
                { "location.city": { $regex: title, $options: "i" } },
                { "location.state": { $regex: title, $options: "i" } },
                { "location.country": { $regex: title, $options: "i" } },
                { category: { $regex: title, $options: "i" } },
            ];
        }

        if (pricePerNight) {
            query.pricePerNight = { $lte: Number(pricePerNight) };
        }

        const listings = await Listing.find(query)
            .sort({ createdAt: -1 })
            .limit(20).lean();

        await client.setEx(cacheKey, 1800, JSON.stringify(listings));


        return res.status(200).json({
            success: true,
            listings,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error. Unable to search hotel",
            error: error.message,
        });
    }
};



export const getCityWiseListings = async(req, res) => {
    try {
        const cacheKey = "listings:citywise";

        // 1️⃣ Check Redis First
        let cacheData;
        try {
            cacheData = await client.get(cacheKey);
        } catch (err) {
            console.error("Redis GET Error:", err.message);
        }

        if (cacheData) {
            console.log("⚡ CityWise Cache HIT");
            return res.status(200).json(JSON.parse(cacheData));
        }

        console.log("🐢 CityWise Cache MISS - Fetching from DB");

        // 2️⃣ Run All Queries in Parallel
        const [
            kashmir,
            mumbai,
            delhi,
            vapi,
            Rajasthan,
            explore
        ] = await Promise.all([

            Listing.find({
                "location.state": { $regex: "^kashmir$", $options: "i" },
                isAvailable: true,
            }).limit(8).lean(),

            Listing.find({
                "location.state": { $regex: "^Maharashtra$", $options: "i" },
                isAvailable: true,
            }).limit(8).lean(),

            Listing.find({
                "location.state": { $regex: "^new delhi$", $options: "i" },
                isAvailable: true,
            }).limit(8).lean(),

            Listing.find({
                "location.state": { $regex: "^Gujarat$", $options: "i" },
                isAvailable: true,
            }).limit(8).lean(),

            Listing.find({
                "location.state": { $regex: "^Rajasthan$", $options: "i" },
                isAvailable: true,
            }).limit(8).lean(),

            Listing.aggregate([
                { $match: { isAvailable: true } },
                { $sample: { size: 10 } },
            ])
        ]);

        const responseData = {
            success: true,
            rows: [{
                    title: "Popular hotel in Kashmir",
                    city: "Kashmir",
                    listings: kashmir,
                },
                {
                    title: "Popular hotel in Mumbai",
                    city: "Mumbai",
                    listings: mumbai,
                },
                {
                    title: "Popular hotel in Delhi",
                    city: "New Delhi",
                    listings: delhi,
                },
                {
                    title: "Popular hotel in Vapi",
                    city: "Vapi",
                    listings: vapi,
                },
                {
                    title: "Popular hotel in Rajasthan ",
                    city: "Rajasthan",
                    listings: Rajasthan,
                },
            ],
            explore, // optional if you want to send it
        };

        // 3️⃣ Store in Redis (30 mins)
        try {
            await client.setEx(
                cacheKey,
                1800,
                JSON.stringify(responseData)
            );
        } catch (err) {
            console.error("Redis SET Error:", err.message);
        }

        return res.status(200).json(responseData);

    } catch (error) {
        console.error("CITY API ERROR 👉", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



export const getUserListings = async(req, res) => {
    try {
        const userId = req.user._id; // set by verifyUser middleware
        const listings = await Listing.find({ host: userId }).lean(); // host is ObjectId

        res.status(200).json({ success: true, listings });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error. Unable to fetch user listings.",
            error: error.message,
        });
    }
};

export const updateListings = async(req, res) => {
    try {
        const { id } = req.params;

        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found",
            });
        }
        console.log("BODY:", req.body);

        // 🔒 Ownership check
        if (listing.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized",
            });
        }

        const updatedData = {...req.body };

        delete updatedData.host;

        // 🔥 FIX 1: Parse location (VERY IMPORTANT)
        if (req.body.location && typeof req.body.location === "string") {
            try {
                req.body.location = JSON.parse(req.body.location);
            } catch (err) {
                console.log("Location parse error", err);
            }
        }

        // 🔥 FIX 2: Merge properly
        if (req.body.location) {
            updatedData.location = {
                ...(listing.location.toObject() || listing.location),
                ...req.body.location,
            };
        }

        /* =============================
           🖼 IMAGE UPDATE LOGIC
        ============================== */

        let finalImages = [];

        if (req.body.existingImages) {
            finalImages = Array.isArray(req.body.existingImages) ?
                req.body.existingImages : [req.body.existingImages];
        }

        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path);
            finalImages = [...finalImages, ...newImages];
        }

        if (finalImages.length > 0) {
            updatedData.images = finalImages;
        }

        const updatedListing = await Listing.findByIdAndUpdate(
            id, { $set: updatedData }, { new: true, runValidators: true }
        );

        await clearListingCache();

        return res.status(200).json({
            success: true,
            message: "Listing updated successfully",
            listing: updatedListing,
        });

    } catch (error) {
        console.error("Update Listing Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};