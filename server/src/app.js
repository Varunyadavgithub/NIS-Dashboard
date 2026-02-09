import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import path from "path";
import { fileURLToPath } from "url";

import routes from "./routes/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import logger from "./utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.info(message.trim()) },
    }),
  );
}

// Rate limiting
app.use("/api", apiLimiter);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use("/api/v1", routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error Handler
app.use(errorHandler);

export default app;
