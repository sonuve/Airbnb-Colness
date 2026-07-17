import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../Confige/Cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "airbnb/listings",
        resource_type: "image",
        transformation: [
            { width: 1200, height: 800, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" }
        ],
    },
});

// File filter (SECURITY)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, PNG images are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
});

export default upload;