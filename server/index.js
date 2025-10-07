import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { User, Clinic, Patient, Medication, Composition } from "./models/index.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "ProDigitalDoctor API is running" });
});

// Database connection test route
app.get("/api/test-db", async (req, res) => {
  try {
    // Test User collection
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


// Start server and connect to database
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("✅ MongoDB connected successfully");

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Test the API at http://localhost:${PORT}`);
      console.log(`🔍 Test DB connection at http://localhost:${PORT}/api/test-db`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();