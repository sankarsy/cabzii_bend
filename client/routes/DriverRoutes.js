const express = require("express");
const {
  createDriverBooking,
  getAllDriverBookings,
  getDriverBookingById,
  updateDriverBooking,
  cancelDriverBooking,
} = require("../controller/DriverController");

const router = express.Router();

// Create a new driver booking
router.post("/book", createDriverBooking);

// Get all driver bookings
router.get("/getall", getAllDriverBookings);

// Get a specific driver booking by categoryId
router.get("/getbyid/:bookingId", getDriverBookingById);

// Update a specific driver booking by bookingId
router.put("/update/:bookingId", updateDriverBooking);

// Cancel a specific driver booking by bookingId
router.delete("/cancel/:bookingId", cancelDriverBooking);

module.exports = router;
