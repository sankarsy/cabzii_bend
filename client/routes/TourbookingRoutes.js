// routes/tourBooking.js
const express = require("express");
const {
  createTourBooking,
  getAllTourBookings,
  getTourBookingById,
  updateTourBookingStatus,
  cancelTourBooking,
} = require("../controller/TourbookingsController");

const router = express.Router();

// Create booking
router.post("/book", createTourBooking);

// Get all bookings
router.get("/getall", getAllTourBookings);

// Get booking by ID
router.get("/:bookingId", getTourBookingById);

// Update booking (status, payment)
router.put("/:bookingId", updateTourBookingStatus);

// Cancel booking
router.put("/:bookingId/cancel", cancelTourBooking);

module.exports = router;
