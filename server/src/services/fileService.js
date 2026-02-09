import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

/**
 * Delete file
 * @param {string} filePath - Path to file
 */
export const deleteFile = async (filePath) => {
  try {
    const fullPath = path.join(__dirname, '../../', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      logger.info(`File deleted: ${filePath}`);
    }
  } catch (error) {
    logger.error(`Error deleting file: ${error.message}`);
  }
};

/**
 * Resize image
 * @param {string} filePath - Path to image
 * @param {number} width - Target width
 * @param {number} height - Target height
 */
export const resizeImage = async (filePath, width = 300, height = 300) => {
  try {
    const fullPath = path.join(__dirname, '../../', filePath);
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    const dir = path.dirname(fullPath);
    const outputPath = path.join(dir, `${baseName}_thumb${ext}`);

    await sharp(fullPath)
      .resize(width, height, { fit: 'cover' })
      .toFile(outputPath);

    return outputPath.replace(path.join(__dirname, '../../'), '');
  } catch (error) {
    logger.error(`Error resizing image: ${error.message}`);
    throw error;
  }
};

/**
 * Get file stats
 * @param {string} filePath - Path to file
 */
export const getFileStats = (filePath) => {
  try {
    const fullPath = path.join(__dirname, '../../', filePath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
      };
    }
    return null;
  } catch (error) {
    logger.error(`Error getting file stats: ${error.message}`);
    return null;
  }
};

/**
 * Ensure upload directories exist
 */
export const ensureUploadDirs = () => {
  const dirs = [
    path.join(uploadsDir, 'photos'),
    path.join(uploadsDir, 'documents'),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`Created directory: ${dir}`);
    }
  });
};

/**
 * Clean old files
 * @param {number} daysOld - Delete files older than this many days
 */
export const cleanOldFiles = async (daysOld = 30) => {
  try {
    const threshold = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (stat.mtime.getTime() < threshold) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      });
    };

    walkDir(path.join(uploadsDir, 'temp'));
    logger.info(`Cleaned ${deletedCount} old files`);
    return deletedCount;
  } catch (error) {
    logger.error(`Error cleaning old files: ${error.message}`);
    return 0;
  }
};

export default {
  deleteFile,
  resizeImage,
  getFileStats,
  ensureUploadDirs,
  cleanOldFiles,
};