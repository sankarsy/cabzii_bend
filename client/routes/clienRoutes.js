const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  getClientProfile,
  updateClientProfile,
  getBookings
} = require("../controller/clientController");

// Test route
router.get("/client/test", (req, res) => {
  res.json({ message: "Client route working!" });
});

// Auth routes
router.post("/client/send-otp", sendOtp);
router.post("/client/verify-otp", verifyOtp);

// Protected routes (require token in headers)
router.put("/client/update-profile", updateClientProfile);
router.get("/client/bookings", getBookings);
router.get("/client/profile", getClientProfile);

module.exports = router;
