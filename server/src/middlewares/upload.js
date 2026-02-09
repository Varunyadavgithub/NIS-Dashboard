import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { FILE_CONFIG } from '../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base upload path
const UPLOAD_BASE_PATH = path.join(__dirname, '../../uploads');

// Ensure directories exist
const ensureDirectories = () => {
  const dirs = ['photos', 'documents', 'temp', 'photos/thumbnails'];
  dirs.forEach((dir) => {
    const fullPath = path.join(UPLOAD_BASE_PATH, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

ensureDirectories();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = UPLOAD_BASE_PATH;

    if (['photo', 'avatar', 'image'].includes(file.fieldname)) {
      uploadPath = path.join(UPLOAD_BASE_PATH, 'photos');
    } else if (['document', 'documents', 'file', 'files'].includes(file.fieldname)) {
      uploadPath = path.join(UPLOAD_BASE_PATH, 'documents');
    } else {
      uploadPath = path.join(UPLOAD_BASE_PATH, 'temp');
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 30)
      .toLowerCase();

    cb(null, `${uniqueId}-${safeName}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const { ALLOWED_IMAGE_TYPES, ALLOWED_DOC_TYPES } = FILE_CONFIG;

  if (['photo', 'avatar', 'image'].includes(file.fieldname)) {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
    }
  } else if (['document', 'documents', 'file', 'files'].includes(file.fieldname)) {
    const allAllowed = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];
    if (allAllowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Invalid file type. Allowed: Images, PDF, Word documents'), false);
    }
  } else {
    cb(null, true);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_CONFIG.MAX_SIZE,
    files: 10,
  },
});

// Upload middleware helpers
export const uploadSingle = (fieldName) => upload.single(fieldName);
export const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
export const uploadFields = (fields) => upload.fields(fields);

// Process and optimize uploaded image
export const processImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const isImage = FILE_CONFIG.ALLOWED_IMAGE_TYPES.includes(req.file.mimetype);
  if (!isImage) return next();

  const filename = req.file.filename;
  const filepath = req.file.path;

  try {
    // Get image metadata
    const metadata = await sharp(filepath).metadata();

    // Only process if image is larger than 1200px
    if (metadata.width > 1200 || metadata.height > 1200) {
      const optimizedPath = filepath.replace(filename, `opt-${filename}`);

      await sharp(filepath)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toFile(optimizedPath);

      // Replace original with optimized
      fs.unlinkSync(filepath);
      fs.renameSync(optimizedPath, filepath);
    }

    // Create thumbnail
    const thumbnailPath = path.join(
      UPLOAD_BASE_PATH,
      'photos/thumbnails',
      `thumb-${filename}`
    );

    await sharp(filepath)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    // Add thumbnail path to file object
    req.file.thumbnail = `/uploads/photos/thumbnails/thumb-${filename}`;
  } catch (error) {
    // If image processing fails, continue without it
    console.error('Image processing error:', error.message);
  }

  next();
});

// Handle multer errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        throw ApiError.badRequest(`File too large. Maximum size is ${FILE_CONFIG.MAX_SIZE / (1024 * 1024)}MB`);
      case 'LIMIT_FILE_COUNT':
        throw ApiError.badRequest('Too many files uploaded');
      case 'LIMIT_UNEXPECTED_FILE':
        throw ApiError.badRequest(`Unexpected file field: ${err.field}`);
      default:
        throw ApiError.badRequest(err.message);
    }
  }
  next(err);
};

// Delete file utility
export const deleteFile = (filePath) => {
  const fullPath = path.join(UPLOAD_BASE_PATH, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    
    // Also delete thumbnail if exists
    const thumbnailPath = fullPath.replace('/photos/', '/photos/thumbnails/').replace(path.basename(fullPath), `thumb-${path.basename(fullPath)}`);
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }
  }
};

// Get file URL
export const getFileUrl = (filename, type = 'photos') => {
  if (!filename) return null;
  if (filename.startsWith('http')) return filename;
  if (filename.startsWith('/uploads')) return filename;
  return `/uploads/${type}/${filename}`;
};

export default upload;