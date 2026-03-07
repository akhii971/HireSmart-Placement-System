import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Configure Cloudinary — called at import time, but env vars are already
// loaded because dotenv.config() runs synchronously in server.js before
// any route file is imported via the router chain.
//
// If you see "Must supply api_key", ensure dotenv.config() runs BEFORE
// importing routes in server.js.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Multer storage engine for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "resumes",
        allowed_formats: ["pdf", "doc", "docx"],
        resource_type: "raw", // required for non-image files (PDF, DOC)
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

export { cloudinary, upload };
