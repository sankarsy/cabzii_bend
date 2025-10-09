// 1️⃣ Load environment variables at the very top
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// 2️⃣ Routes

// Admin routes
const adminRoute = require("./admin/routes/userRoutes");

// Client routes
const clientRoute = require("./client/routes/clienRoutes");

// TourBookings routes
const TourBookingsRoute = require("./client/routes/TourbookingRoutes");

// Tour package routes
const tourRoutes = require("./TourPackage/routes/TourRoutes");

//Tour Package List
const tourPackageListRoutes = require("./TourPackage/routes/TourPackageListRoutes")

// Vehicle routes
const VehicleRoutes = require("./vehicle/routes/vehicleRoutes");

//driver routes
const DriverRoutes = require("./calldriver/routes/driverRoutes");

//cab routes
const cabRoutes = require("./cabservice/routes/cabRoutes");

const app = express();
//sankarsv
// 3️⃣ Middleware
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8000",
    "https://cabzii.in",
    "https://www.cabzii.in",
    "https://admin.cabzii.in",
    "https://www.admin.cabzii.in",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/", (req, res) => res.json({ message: "API is running!" }));

// 4️⃣ Mount routes
//admin routes

app.use("/api", adminRoute);
app.use("/api/tour", tourRoutes);
app.use("/api/tourpackagelist", tourPackageListRoutes)
app.use("/api/vehicle", VehicleRoutes);
app.use("/api/driver", DriverRoutes);
app.use("/api/cab", cabRoutes);

//client routes
app.use("/api", clientRoute);
//tour booking routes
app.use("/api/tourbookings", TourBookingsRoute);


// cabrental routes
const cabRentalRoutes = require("./client/routes/cabRentalRoutes");
app.use("/api/cab-rentals", cabRentalRoutes);

// driver booking routes
const driverBookingRoutes = require("./client/routes/DriverRoutes");
app.use("/api/driver-bookings", driverBookingRoutes);

// vehicle booking routes
const vehicleBookingRoutes = require("./client/routes/vehicleBookingRoutes"); // Adjust path

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

// MongoDB connection & server start
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 8000, () => console.log("Server running"));

    // Debug: ensure environment variables are loaded
    // console.log("FACTOR2_API_KEY:", process.env.FACTOR2_API_KEY);
    // console.log("FAST2SMS_API_KEY:", process.env.FAST2SMS_API_KEY);
  })
  .catch((err) => console.error("MongoDB connection error:", err));
