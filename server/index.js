import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import connectDB from "./config/db.js";
import {
  User,
  Clinic,
  Patient,
  Medication,
  Composition,
} from "./models/index.js";
import logger from "./utils/logger.js";

// Routes
import authRoutes from "./routes/auth.js";
import webhookRoutes from "./routes/webhook.js";
import clinicRoutes from "./routes/clinics.js";
import patientRoutes from "./routes/patients.js";
import appointmentRoutes from "./routes/appointments.js";
import medicationRoutes from "./routes/medications.js";
import compositionRoutes from "./routes/compositions.js";
import prescriptionRoutes from "./routes/prescriptions.js";
import uploadRoutes from "./routes/uploads.js";
import analyticsRoutes from "./routes/analytics.js";
import adminRoutes from "./routes/admin.js";
import subscriptionRoutes from "./routes/subscription.js";

// Middleware
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";

// Cron Jobs
import { startAutoCancelJob } from "./cron/autoCancelAppointments.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:5173"],
    credentials: true,
  })
);

// Request logging
app.use((req, res, next) => {
  logger.info(
    {
      method: req.method,
      path: req.path,
      ip: req.ip,
    },
    "Incoming request"
  );
  next();
});

// Webhook routes MUST come before express.json() middleware
// Webhooks need raw body for signature verification
app.use(
  "/api/webhooks",
  express.raw({ type: "application/json" }),
  webhookRoutes
);

// Parse JSON for all other routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoints (before rate limiting)
app.get("/", (req, res) => {
  res.json({
    message: "ProDigitalDoctor API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// Simple health check for cron jobs (no rate limiting)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Apply rate limiting to all API routes (except health check)
app.use("/api/", apiLimiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/clinics", clinicRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/compositions", compositionRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);

// Database connection test route
app.get("/api/test-db", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const clinicCount = await Clinic.countDocuments();
    const patientCount = await Patient.countDocuments();
    const medicationCount = await Medication.countDocuments();
    const compositionCount = await Composition.countDocuments();

    res.json({
      success: true,
      message: "Database connection successful",
      collections: {
        users: userCount,
        clinics: clinicCount,
        patients: patientCount,
        medications: medicationCount,
        compositions: compositionCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server and connect to database
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info("MongoDB connected successfully");

    // Start cron jobs
    startAutoCancelJob();

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`Test the API at http://localhost:${PORT}`);
      logger.info(`Test DB connection at http://localhost:${PORT}/api/test-db`);
    });
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT signal received: closing HTTP server");
  process.exit(0);
});

startServer();
