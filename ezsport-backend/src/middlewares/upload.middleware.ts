import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../configs/cloudinary";

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "ezsport/venues", // Cloudinary folder name
      allowed_formats: ["jpg", "jpeg", "png", "webp"], // Allowed formats
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}` // Unique file name
    };
  },
});

// Create Multer upload instance
const upload = multer({ storage: storage });

export default upload;
