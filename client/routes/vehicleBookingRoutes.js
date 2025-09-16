const express = require("express");
const router = express.Router();
const vehicleBookingController = require("../controller/vehicleBookingController");

// Create new vehicle booking
router.post("/create", vehicleBookingController.createVehicleBooking);

// Update existing booking by bookingId
router.put("/update/:bookingId", vehicleBookingController.updateVehicleBooking);

// Cancel booking by bookingId
router.put("/cancel/:bookingId", vehicleBookingController.cancelVehicleBooking);

module.exports = router;
