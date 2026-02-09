import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate random string
 */
export const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Generate OTP
 */
export const generateOTP = (length = 6) => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

/**
 * Generate unique ID
 */
export const generateUniqueId = () => {
  return uuidv4();
};

/**
 * Generate employee ID
 */
export const generateEmployeeId = (prefix, count) => {
  return `${prefix}-${String(count).padStart(5, "0")}`;
};

/**
 * Hash token using SHA256
 */
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Encrypt text using AES
 */
export const encrypt = (text) => {
  const key = process.env.ENCRYPTION_KEY;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(key.padEnd(32).slice(0, 32)),
    iv,
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

/**
 * Decrypt text using AES
 */
export const decrypt = (text) => {
  const key = process.env.ENCRYPTION_KEY;
  const parts = text.split(":");
  const iv = Buffer.from(parts.shift(), "hex");
  const encryptedText = Buffer.from(parts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key.padEnd(32).slice(0, 32)),
    iv,
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

/**
 * Format currency (INR)
 */
export const formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate working hours
 */
export const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = (end - start) / (1000 * 60 * 60);
  return Math.round(diff * 100) / 100;
};

/**
 * Get date range based on period
 */
export const getDateRange = (period) => {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case "today":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case "yesterday":
      startDate = new Date(now.setDate(now.getDate() - 1));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "week":
      startDate = new Date(now.setDate(now.getDate() - now.getDay()));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date();
      break;
    case "quarter":
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date();
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date();
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 30));
      endDate = new Date();
  }

  return { startDate, endDate };
};

/**
 * Parse sort string to MongoDB sort object
 */
export const parseSort = (sortString) => {
  if (!sortString) return { createdAt: -1 };

  const sortObj = {};
  const fields = sortString.split(",");

  fields.forEach((field) => {
    if (field.startsWith("-")) {
      sortObj[field.substring(1)] = -1;
    } else {
      sortObj[field] = 1;
    }
  });

  return sortObj;
};

/**
 * Filter object - remove undefined/null values and keep only allowed fields
 */
export const filterObject = (obj, allowedFields) => {
  const filtered = {};
  Object.keys(obj).forEach((key) => {
    if (
      allowedFields.includes(key) &&
      obj[key] !== undefined &&
      obj[key] !== null &&
      obj[key] !== ""
    ) {
      filtered[key] = obj[key];
    }
  });
  return filtered;
};



/**
 * Mask sensitive data
 */
export const maskEmail = (email) => {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 2)}***@${domain}`;
};

export const maskPhone = (phone) => {
  return phone.slice(0, 3) + "****" + phone.slice(-3);
};

export const maskAadhar = (aadhar) => {
  return "XXXX-XXXX-" + aadhar.slice(-4);
};

/**
 * Check if date is valid
 */
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

/**
 * Get month name
 */
export const getMonthName = (monthIndex) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[monthIndex];
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100 * 100) / 100;
};

/**
 * Generate a unique ID with prefix
 * @param {string} prefix - Prefix for the ID
 * @param {number} count - Current count
 * @returns {string} Generated ID
 */
export const generateId = (prefix, count) => {
  const paddedCount = String(count + 1).padStart(5, "0");
  return `${prefix}-${paddedCount}`;
};

/**
 * Calculate date difference in days
 * @param {Date} date1
 * @param {Date} date2
 * @returns {number} Difference in days
 */
export const dateDiffInDays = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get start and end of month
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {Object} { startDate, endDate }
 */
export const getMonthDateRange = (month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return { startDate, endDate };
};


/**
 * Calculate age from date of birth
 * @param {Date} dob - Date of birth
 * @returns {number} Age in years
 */
export const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Sanitize object - remove undefined and null values
 * @param {Object} obj
 * @returns {Object} Sanitized object
 */
export const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== "") {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Get working days in a month
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @param {Array} holidays - Array of holiday dates
 * @returns {number} Number of working days
 */
export const getWorkingDaysInMonth = (month, year, holidays = []) => {
  const { startDate, endDate } = getMonthDateRange(month, year);
  let workingDays = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    const dateStr = current.toISOString().split("T")[0];

    // Exclude Sundays (0) and holidays
    if (dayOfWeek !== 0 && !holidays.includes(dateStr)) {
      workingDays++;
    }

    current.setDate(current.getDate() + 1);
  }

  return workingDays;
};

/**
 * Parse boolean from string
 * @param {string|boolean} value
 * @returns {boolean}
 */
export const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }
  return false;
};

/**
 * Slugify string
 * @param {string} text
 * @returns {string} Slugified string
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};
