const jwt = require("jsonwebtoken");
const Client = require("../model/clientSchema");

const secret_Key = process.env.JWT_SECRET || "ABCDEF";

// Helper: Generate Unique Booking ID
const generateBookingId = () =>
  `CAR${Math.floor(100000 + Math.random() * 900000)}`;

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

/* ───────────── Create Cab Rental Booking ───────────── */
const createCabRental = async (req, res) => {
  const clientId = extractClientId(req);
  if (!clientId) return res.status(401).json({ message: "Unauthorized or invalid token" });

  try {
    const {
      cabId,
      cabName,
      packageType,
      cabpackage,
      price = 0,
      offerPrice = 0,
      discountPercentage = 0,
      pickup = {},
      contact = {},
      bookingValue,
      couponCode = "",
      cabType = "oneWay",
      clientNote = "",
      paymentMethod = "pay_on_ride",
    } = req.body;

    if (!cabId || !cabName || bookingValue === undefined) {
      return res.status(400).json({
        message: "Missing required fields (cabId, cabName, bookingValue)",
      });
    }

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: "Client not found" });

    const newBooking = {
      bookingId: generateBookingId(),
      cabId,
      cabName,
      packageType,
      cabpackage,
      price,
      offerPrice,
      discountPercentage,
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
      contact: {
        contactName: contact.contactName || "",
        contactPhone: contact.contactPhone || "",
        contactEmail: contact.contactEmail || "",
      },
      cabType,
      bookingValue,
      couponCode,
      clientNote,
      bookingTime: new Date(),
      cancellation: {
        reason: "",
        cancelledAt: null,
        cancelTime: null,
        isRefunded: false,
        refundAmount: 0,
        refundProcessedAt: null,
      },
      status: "booked",
      paymentMethod,
      paymentStatus: "pending",
      transactionId: "",
    };

    client.cabRentals.push(newBooking);
    await client.save();

    res.status(201).json({
      success: true,
      message: "Cab rental booking created",
      data: newBooking,
    });
  } catch (error) {
    console.error("❌ Error creating cab booking:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/* ───────────── Get All Cab Rentals ───────────── */
const getAllCabRentals = async (req, res) => {
  try {
    const clients = await Client.find({ "cabRentals.0": { $exists: true } });

    const bookings = clients.flatMap((client) =>
      client.cabRentals.map((booking) => ({
        ...booking.toObject(),
        clientMobile: client.mobile,
        clientName: `${client.firstname || ""} ${client.lastname || ""}`.trim(),
      }))
    );

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error("❌ Error fetching cab rentals:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ───────────── Get Cab Rental by ID ───────────── */
const getCabRentalById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const client = await Client.findOne({ "cabRentals.bookingId": bookingId });
    if (!client) return res.status(404).json({ message: "Booking not found" });

    const booking = client.cabRentals.find((b) => b.bookingId === bookingId);

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error("❌ Error fetching cab rental:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ───────────── Update Cab Rental ───────────── */
const updateCabRental = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, paymentStatus, transactionId, bookingValue } = req.body;

    const client = await Client.findOne({ "cabRentals.bookingId": bookingId });
    if (!client) return res.status(404).json({ message: "Booking not found" });

    const booking = client.cabRentals.find((b) => b.bookingId === bookingId);

    if (status !== undefined) booking.status = status;
    if (paymentStatus !== undefined) booking.paymentStatus = paymentStatus;
    if (transactionId !== undefined) booking.transactionId = transactionId;
    if (bookingValue !== undefined) booking.bookingValue = bookingValue;

    await client.save();

    res.status(200).json({ success: true, message: "Booking updated", data: booking });
  } catch (error) {
    console.error("❌ Error updating cab rental:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ───────────── Cancel Cab Rental ───────────── */
const cancelCabRental = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { cancellationReason } = req.body;

    const client = await Client.findOne({ "cabRentals.bookingId": bookingId });
    if (!client) return res.status(404).json({ message: "Booking not found" });

    const booking = client.cabRentals.find((b) => b.bookingId === bookingId);

    booking.status = "cancelled";
    booking.cancellation.reason = cancellationReason || "";
    booking.cancellation.cancelledAt = new Date();
    booking.cancellation.cancelTime = new Date();

    await client.save();

    res.status(200).json({ success: true, message: "Booking cancelled", data: booking });
  } catch (error) {
    console.error("❌ Error cancelling cab rental:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createCabRental,
  getAllCabRentals, 
  getCabRentalById,
  updateCabRental,
  cancelCabRental,
};
