// index.js

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const userRoute = require("./router/userRoute");
const carRoute = require("./router/carRoute");
const travelRoutes = require("./router/travelPackageRoutes");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS Configuration
const corsOptions = {
  origin: [
    "http://localhost:3000", // ✅ Local React frontend
    "http://localhost:3001", // ✅ Local React frontend
    "http://localhost:8000", // Local API or Admin if needed
    "https://cabzii.in",
    "https://www.cabzii.in",
    "https://admin.cabzii.in",
    "https://www.admin.cabzii.in",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "API is running!" });
});

// API routes
app.use("/api", userRoute);
app.use("/api", carRoute);
app.use("/api", travelRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// MongoDB connection and server start
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log("Server running");
    });
  })
  .catch(console.error);
