const cloudinary = require('cloudinary').v2; // 1. Import .v2

// 2. Configure using .v2
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("FATAL ERROR: Cloudinary environment variables are missing. Please check your .env file.");
  // We can choose to throw or just warn. Throwing prevents the app from starting if this is critical.
  // For now, let's warn so other parts of the app can still run.
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary; 