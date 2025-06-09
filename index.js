const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const userRoute = require("./router/userRoute");
const carRoute = require("./router/carRoute");
const travelRoutes = require("./router/travelPackageRoutes");
require("dotenv").config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:8000",
    "https://cabzii.in",
    "https://www.cabzii.in",
    "https://admin.cabzii.in",
    "https://www.admin.cabzii.in",
  ],
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true,
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Health check route
app.get("/", (req, res) => {
  res.json({ message: "API is running!" });
});

// ✅ API routes
app.use("/api", userRoute);
app.use("/api", carRoute);
app.use("/api", travelRoutes);

// ✅ JSON 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// MongoDB and Server start
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log("Server running");
    });
  })
  .catch(console.error);
