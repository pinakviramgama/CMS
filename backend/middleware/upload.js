// middleware/upload.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Configure Cloudinary storage for PDFs
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "pdf-materials",
    resource_type: "raw", // PDFs need to be raw
    format: "pdf",
  },
});

// Create multer instance with Cloudinary storage
const upload = multer({ storage });

module.exports = upload;
