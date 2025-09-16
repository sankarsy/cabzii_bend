// 1️⃣ Load environment variables at the very top
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// 2️⃣ Routes

// Old routes
const carRoute = require("./router/carRoute");
const travelRoutes = require("./router/travelPackageRoutes");

// Admin routes
const adminRoute = require("./admin/routes/userRoutes");

// Client routes
const clientRoute = require("./client/routes/clienRoutes");

// TourBookings routes
const TourBookingsRoute = require("./client/routes/TourbookingRoutes");

// Tour package routes
const tourRoutes = require("./TourPackage/routes/TourRoutes");

// Vehicle routes
const VehicleRoutes = require("./vehicle/routes/vehicleRoutes");

//driver routes
const DriverRoutes = require("./calldriver/routes/driverRoutes");

//cab routes
const cabRoutes = require("./cabservice/routes/cabRoutes");

const app = express();

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
//old routes
app.use("/api", carRoute);
console.log("✅ Car routes loaded");

app.use("/api", travelRoutes);
console.log("✅ Travel package routes loaded");


//admin routes

app.use("/api", adminRoute);
console.log("✅ Admin routes loaded");

app.use("/api/tour", tourRoutes);
console.log("✅ Tour routes loaded");

app.use("/api/vehicle", VehicleRoutes);
console.log("✅ Vehicle routes loaded");

app.use("/api/driver", DriverRoutes);
console.log("✅ Driver routes loaded");

app.use("/api/cab", cabRoutes);
console.log("✅ Cab routes loaded");




//client routes

app.use("/api", clientRoute);
console.log("✅ Client routes loaded");

//tour booking routes
app.use("/api/tourbookings", TourBookingsRoute);
console.log("✅ Bookings routes loaded");

// cabrental routes
const cabRentalRoutes = require("./client/routes/cabRentalRoutes");
app.use("/api/cab-rentals", cabRentalRoutes);
console.log("✅ Cab rental routes loaded");

// driver booking routes
const driverBookingRoutes = require("./client/routes/DriverRoutes");
app.use("/api/driver-bookings", driverBookingRoutes);
console.log("✅ Driver booking routes loaded");

// vehicle booking routes
const vehicleBookingRoutes = require("./client/routes/vehicleBookingRoutes"); // Adjust path
app.use("/api/vehicle-bookings", vehicleBookingRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

// MongoDB connection & server start
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 8000, () => console.log("Server running"));

    // Debug: ensure environment variables are loaded
    console.log("FACTOR2_API_KEY:", process.env.FACTOR2_API_KEY);
    console.log("FAST2SMS_API_KEY:", process.env.FAST2SMS_API_KEY);
  })
  .catch((err) => console.error("MongoDB connection error:", err));
