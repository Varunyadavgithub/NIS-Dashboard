import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import ApiError from "../utils/ApiError.js";
import { FILE_CONFIG } from "./constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadDirs = ["uploads/photos", "uploads/documents", "uploads/temp"];
uploadDirs.forEach((dir) => {
  const fullPath = path.join(__dirname, "../../", dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, "../../uploads/");

    // Determine folder based on field name or file type
    if (file.fieldname === "photo" || file.fieldname === "avatar") {
      uploadPath += "photos/";
    } else if (
      file.fieldname === "document" ||
      file.fieldname === "documents"
    ) {
      uploadPath += "documents/";
    } else {
      uploadPath += "temp/";
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedName = file.originalname
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 30);

    cb(null, `${uniqueId}-${sanitizedName}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const { ALLOWED_IMAGE_TYPES, ALLOWED_DOC_TYPES } = FILE_CONFIG;

  // Check for image uploads
  if (file.fieldname === "photo" || file.fieldname === "avatar") {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ApiError(
          400,
          `Invalid image type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
        ),
        false,
      );
    }
  }
  // Check for document uploads
  else if (file.fieldname === "document" || file.fieldname === "documents") {
    const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Invalid file type for document"), false);
    }
  }
  // Allow other files with basic check
  else {
    cb(null, true);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_CONFIG.MAX_SIZE,
    files: 10, // Max 10 files per request
  },
});

// Upload middleware functions
export const uploadSingle = (fieldName) => upload.single(fieldName);
export const uploadMultiple = (fieldName, maxCount = 5) =>
  upload.array(fieldName, maxCount);
export const uploadFields = (fields) => upload.fields(fields);

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(
        new ApiError(
          400,
          `File too large. Maximum size is ${FILE_CONFIG.MAX_SIZE / (1024 * 1024)}MB`,
        ),
      );
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return next(new ApiError(400, "Too many files uploaded"));
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return next(new ApiError(400, `Unexpected file field: ${err.field}`));
    }
    return next(new ApiError(400, err.message));
  }
  next(err);
};

export default upload;
