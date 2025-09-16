const jwt = require("jsonwebtoken");
const Client = require("../model/clientSchema");

const secret_Key = process.env.JWT_SECRET || "ABCDEF";

// Helper: Generate Unique Booking ID
const generateBookingId = () =>
  `DRIVER${Math.floor(100000 + Math.random() * 900000)}`;

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

/* ───────────── Create Driver Booking ───────────── */
const createDriverBooking = async (req, res) => {
  const clientId = extractClientId(req);
  if (!clientId) {
    return res.status(401).json({ message: "Unauthorized or invalid token" });
  }

  try {
    const {
      categoryId,
      categoryName,
      categoryType,
      packageName,
      price,
      offerPrice,
      discountPercentage,
      pickup = {},
      contact = {},
      clientNote,
      totalFare,
      paymentMethod = "pay_on_ride",
    } = req.body;

    if (!categoryId || !categoryName || totalFare === undefined) {
      return res.status(400).json({
        message: "Missing required fields (categoryId, categoryName, totalFare)",
      });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const newBooking = {
      bookingId: generateBookingId(),
      categoryId,
      categoryName,
      categoryType,
      packageName,
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
      clientNote: clientNote || "",
      totalFare,
      paymentMethod,
      paymentStatus: "pending",
      transactionId: "",
      status: "booked",
    };

    client.driverBookings.push(newBooking);
    await client.save();

    res.status(201).json({
      success: true,
      message: "Driver booking created",
      data: newBooking,
    });
  } catch (error) {
    console.error("❌ Error creating driver booking:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/* ───────────── Get All Driver Bookings ───────────── */
const getAllDriverBookings = async (req, res) => {
  try {
    const clients = await Client.find({ "driverBookings.0": { $exists: true } });

    const bookings = clients.flatMap((client) =>
      client.driverBookings.map((booking) => ({
        ...booking.toObject(),
        clientMobile: client.mobile,
        clientName: `${client.firstname || ""} ${client.lastname || ""}`.trim(),
      }))
    );

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("❌ Error fetching driver bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ───────────── Get Driver Booking by ID ───────────── */
const getDriverBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const client = await Client.findOne({ "driverBookings.bookingId": bookingId });

    if (!client) return res.status(404).json({ message: "Booking not found" });

    const booking = client.driverBookings.find((b) => b.bookingId === bookingId);

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error("❌ Error fetching driver booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ───────────── Update Driver Booking ───────────── */
const updateDriverBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, paymentStatus, transactionId, totalFare } = req.body;

    const client = await Client.findOne({ "driverBookings.bookingId": bookingId });
    if (!client) return res.status(404).json({ message: "Booking not found" });

    const booking = client.driverBookings.find((b) => b.bookingId === bookingId);

    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (transactionId) booking.transactionId = transactionId;
    if (totalFare !== undefined) booking.totalFare = totalFare;

    await client.save();

    res.status(200).json({
      success: true,
      message: "Booking updated",
      data: booking,
    });
  } catch (error) {
    console.error("❌ Error updating driver booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ───────────── Cancel Driver Booking ───────────── */
const cancelDriverBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { cancellationReason } = req.body;

    const client = await Client.findOne({ "driverBookings.bookingId": bookingId });
    if (!client) return res.status(404).json({ message: "Booking not found" });

    const booking = client.driverBookings.find((b) => b.bookingId === bookingId);

    booking.status = "cancelled";
    booking.cancellationReason = cancellationReason;
    booking.cancelledAt = new Date();
    booking.isRefunded = false;
    booking.refundAmount = 0;
    booking.refundProcessedAt = null;

    await client.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled",
      data: booking,
    });
  } catch (error) {
    console.error("❌ Error cancelling driver booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createDriverBooking,
  getAllDriverBookings,
  getDriverBookingById,
  updateDriverBooking,
  cancelDriverBooking,
};
