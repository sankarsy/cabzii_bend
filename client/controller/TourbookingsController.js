const jwt = require("jsonwebtoken");
const Client = require("../model/clientSchema");

const secret_Key = process.env.JWT_SECRET || "ABCDEF";

// Helper: Generate Unique Booking ID
const generateBookingId = () =>
  `TOUR${Math.floor(100000 + Math.random() * 900000)}`;

// Helper: Extract clientId from Bearer token
const extractClientId = (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, secret_Key);
    return decoded.clientId;
  } catch (err) {
    return null;
  }
};

/* ───────────── Create Tour Booking ───────────── */
const createTourBooking = async (req, res) => {
  const clientId = extractClientId(req);
  if (!clientId) {
    return res.status(401).json({ message: "Unauthorized or invalid token" });
  }

  try {
    const {
      packageName,
      subTourName,
      price,
      offerPrice,
      discountPercentage,
      packageType,

      pickup = {},
      drop = {},
      contact = {},
      members = [],

      clientNote,
      paymentMethod = "pay_on_ride",
    } = req.body;

    // Validation (allow offerPrice-only bookings)
    if (!packageName || (!price && !offerPrice)) {
      return res.status(400).json({
        message: "Missing required fields (packageName, price/offerPrice)",
      });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Fare calculation
    const baseFarePerPerson = offerPrice || price;
    const memberCount = members.length || 1;
    const baseFare = baseFarePerPerson * memberCount;
    const taxes = Math.round(baseFare * 0.05);
    const totalFare = baseFare + taxes;

    // New booking object
    const newBooking = {
      bookingId: generateBookingId(),
      packageName,
      subTourName,
      price,
      offerPrice,
      discountPercentage,
      packageType,

      pickup: {
        doorNo: pickup.doorNo || "",
        street: pickup.street || "",
        landmark: pickup.landmark || "",
        city: pickup.city || "",
        state: pickup.state || "",
        zip: pickup.zip || "",
        date: pickup.date ? new Date(pickup.date) : null,
        time: pickup.time || "",
      },
      
      contact,
      members,

      clientNote: clientNote || "",

      totalFare,
      paymentMethod,
      paymentStatus: "pending",
      status: "booked",
    };

    client.tourBookings.push(newBooking);
    await client.save();

    res.status(201).json({
      success: true,
      message: "Tour booking created",
      data: newBooking,
    });
  } catch (error) {
    console.error("❌ Error creating tour booking:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/* ───────────── Get All Tour Bookings ───────────── */
const getAllTourBookings = async (req, res) => {
  try {
    const clients = await Client.find({ "tourBookings.0": { $exists: true } });

    const bookings = clients.flatMap((client) =>
      client.tourBookings.map((booking) => ({
        ...booking.toObject(),
        clientMobile: client.mobile,
        clientName: `${client.firstname || ""} ${client.lastname || ""}`.trim(),
      }))
    );

    res
      .status(200)
      .json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error("❌ Error fetching tour bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ───────────── Get Booking by ID ───────────── */
const getTourBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const client = await Client.findOne({ "tourBookings.bookingId": bookingId });

    if (!client) return res.status(404).json({ message: "Booking not found" });

    const booking = client.tourBookings.find((b) => b.bookingId === bookingId);

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error("❌ Error fetching booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ───────────── Update Status / Payment ───────────── */
const updateTourBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, paymentStatus, rideCompletedAt, transactionId } = req.body;

    const client = await Client.findOne({ "tourBookings.bookingId": bookingId });
    if (!client) return res.status(404).json({ message: "Booking not found" });

    const booking = client.tourBookings.find((b) => b.bookingId === bookingId);

    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (rideCompletedAt) booking.rideCompletedAt = new Date(rideCompletedAt);
    if (transactionId) booking.transactionId = transactionId;

    await client.save();

    res
      .status(200)
      .json({ success: true, message: "Booking updated", data: booking });
  } catch (error) {
    console.error("❌ Error updating booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ───────────── Cancel Booking ───────────── */
const cancelTourBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { cancellationReason } = req.body;

    const client = await Client.findOne({ "tourBookings.bookingId": bookingId });
    if (!client) return res.status(404).json({ message: "Booking not found" });

    const booking = client.tourBookings.find((b) => b.bookingId === bookingId);
    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancellationReason = cancellationReason;

    await client.save();

    res
      .status(200)
      .json({ success: true, message: "Booking cancelled", data: booking });
  } catch (error) {
    console.error("❌ Error cancelling booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTourBooking,
  getAllTourBookings,
  getTourBookingById,
  updateTourBookingStatus,
  cancelTourBooking,
};
