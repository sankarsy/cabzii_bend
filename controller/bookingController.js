const Booking = require("../model/bookingSchema");

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("carId");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

// Add a new booking
exports.createBooking = async (req, res) => {
  const { carId, tripType, pickupLocation, dropLocation, date, returnDate } = req.body;

  try {
    const booking = new Booking({
      carId,
      tripType,
      pickupLocation,
      dropLocation,
      date,
      returnDate,
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Failed to create booking" });
  }
};
