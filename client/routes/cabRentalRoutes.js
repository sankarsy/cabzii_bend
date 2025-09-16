const express = require("express");
const router = express.Router();
const cabRentalController = require("../controller/cabRentalController");

// Create a new cab rental booking
router.post("/book", cabRentalController.createCabRental);

// Get all cab rentals
router.get("/getall", cabRentalController.getAllCabRentals);

// Get a specific cab rental by booking ID
router.get("/get/:bookingId", cabRentalController.getCabRentalById);

// Update a cab rental (status, payment, etc.)
router.put("/update/:bookingId", cabRentalController.updateCabRental);

// Cancel a cab rental
router.put("/cancel/:bookingId", cabRentalController.cancelCabRental);

module.exports = router;
