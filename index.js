// Load env
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// Routes

const adminRoute = require("./admin/routes/userRoutes");
const clientRoute = require("./client/routes/clienRoutes");
const TourBookingsRoute = require("./client/routes/TourbookingRoutes");
const tourRoutes = require("./TourPackage/routes/TourRoutes");
const tourPackageListRoutes = require("./TourPackage/routes/TourPackageListRoutes");
const VehicleRoutes = require("./vehicle/routes/vehicleRoutes");
const DriverRoutes = require("./calldriver/routes/driverRoutes");
const cabRoutes = require("./cabservice/routes/cabRoutes");

// Client booking routes
const cabRentalRoutes = require("./client/routes/cabRentalRoutes");
const driverBookingRoutes = require("./client/routes/DriverRoutes");
const vehicleBookingRoutes = require("./client/routes/vehicleBookingRoutes");

// Upload Config
const upload = require("./storageconfig/StorageFile");

const app = express();

// JSON middleware
app.use(express.json({ limit: "10mb" }));

// CORS
app.use(
  cors({
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
  })
);

// Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "API is running!" });
});

// API Routes
app.use("/api", adminRoute);
app.use("/api/tour", tourRoutes);
app.use("/api/tourpackagelist", tourPackageListRoutes);
app.use("/api/vehicle", VehicleRoutes);
app.use("/api/driver", DriverRoutes);
app.use("/api/cab", cabRoutes);

app.use("/api", clientRoute);
app.use("/api/tourbookings", TourBookingsRoute);

app.use("/api/cab-rentals", cabRentalRoutes);
app.use("/api/driver-bookings", driverBookingRoutes);
app.use("/api/vehicle-bookings", vehicleBookingRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// MongoDB + Server start
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => console.log("🚀 Server running on port " + PORT));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
