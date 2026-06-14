import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../configs/cloudinary";
import path from "path";
import fs from "fs";

// Create local storage fallback configuration
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});

// Configure Cloudinary storage
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "ezsport/venues", // Cloudinary folder name
      allowed_formats: ["jpg", "jpeg", "png", "webp"], // Allowed formats
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}` // Unique file name
    };
  },
});

// Create custom fallback storage engine
const fallbackStorage = {
  _handleFile: function (req: any, file: any, cb: any) {
    // Try Cloudinary storage first
    (cloudinaryStorage as any)._handleFile(req, file, function (err: any, info: any) {
      if (err) {
        console.warn("Cloudinary upload failed, falling back to local disk storage:", err.message || err);
        // Fall back to local disk storage
        (localStorage as any)._handleFile(req, file, function (localErr: any, localInfo: any) {
          if (localErr) {
            return cb(localErr);
          }
          // Construct local web URL
          const host = req.get('host') || 'localhost:5000';
          const protocol = req.protocol || 'http';
          // Make sure we include protocol and host
          const webPath = `${protocol}://${host}/uploads/${localInfo.filename}`;
          cb(null, {
            path: webPath,
            size: localInfo.size,
            filename: localInfo.filename
          });
        });
      } else {
        cb(null, info);
      }
    });
  },
  _removeFile: function (req: any, file: any, cb: any) {
    if (file.path && file.path.includes('/uploads/')) {
      const filename = file.filename;
      const filePath = path.join(__dirname, "../../uploads", filename);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, cb);
      } else {
        cb(null);
      }
    } else {
      (cloudinaryStorage as any)._removeFile(req, file, cb);
    }
  }
};

// Create Multer upload instance using fallback storage
// Important: Set limits and ensure FormData fields are parsed
const upload = multer({ 
  storage: fallbackStorage as any,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 5
  }
});

export default upload;
