const jwt = require("jsonwebtoken");
const Client = require("../model/clientSchema"); // Adjust the path as needed

const secret_Key = process.env.JWT_SECRET || "ABCDEF";

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

// Helper: Generate Unique Booking ID
const generateBookingId = () =>
  `VEH${Math.floor(100000 + Math.random() * 900000)}`;

// ───────────── Create Vehicle Booking ─────────────
const createVehicleBooking = async (req, res) => {
  const clientId = extractClientId(req);
  if (!clientId) return res.status(401).json({ message: "Unauthorized or invalid token" });

  try {
    const {
      vehicleId,
      vehicleIdName,
      vehicleType,
      packageName,
      price = 0,
      offerPrice = 0,
      discountPercentage = 0,
      pickup = {},
      contact = {},
      clientNote = "",
      totalFare = 0,
      paymentMethod = "pay_on_ride",
    } = req.body;

    if (!vehicleId || !vehicleIdName || !packageName) {
      return res.status(400).json({
        message: "Missing required fields (vehicleId, vehicleIdName, packageName)",
      });
    }

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: "Client not found" });

    const newBooking = {
      bookingId: generateBookingId(),
      vehicleId,
      vehicleIdName,
      vehicleType,
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
      clientNote,
      totalFare,
      paymentMethod,
      paymentStatus: "pending",
      transactionId: "",
      status: "booked",
      cancelledAt: null,
      cancellationReason: "",
      rideCompletedAt: null,
      isRefunded: false,
      refundAmount: 0,
      refundProcessedAt: null,
    };

    client.vehicleBookings.push(newBooking);
    await client.save();

    res.status(201).json({
      success: true,
      message: "Vehicle booking created",
      data: newBooking,
    });
  } catch (error) {
    console.error("❌ Error creating vehicle booking:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ───────────── Update Vehicle Booking ─────────────
const updateVehicleBooking = async (req, res) => {
  const clientId = extractClientId(req);
  if (!clientId) return res.status(401).json({ message: "Unauthorized or invalid token" });

  try {
    const { bookingId } = req.params;
    const { status, paymentStatus, transactionId, totalFare, clientNote } = req.body;

    const client = await Client.findOne({ _id: clientId, "vehicleBookings.bookingId": bookingId });
    if (!client) return res.status(404).json({ message: "Booking not found" });

    const booking = client.vehicleBookings.find(b => b.bookingId === bookingId);

    if (status !== undefined) booking.status = status;
    if (paymentStatus !== undefined) booking.paymentStatus = paymentStatus;
    if (transactionId !== undefined) booking.transactionId = transactionId;
    if (totalFare !== undefined) booking.totalFare = totalFare;
    if (clientNote !== undefined) booking.clientNote = clientNote;

    await client.save();

    res.status(200).json({ success: true, message: "Booking updated", data: booking });
  } catch (error) {
    console.error("❌ Error updating vehicle booking:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ───────────── Cancel Vehicle Booking ─────────────
const cancelVehicleBooking = async (req, res) => {
  const clientId = extractClientId(req);
  if (!clientId) return res.status(401).json({ message: "Unauthorized or invalid token" });

  try {
    const { bookingId } = req.params;
    const { cancellationReason = "Cancelled by client" } = req.body;

    const client = await Client.findOne({ _id: clientId, "vehicleBookings.bookingId": bookingId });
    if (!client) return res.status(404).json({ message: "Booking not found" });

    const booking = client.vehicleBookings.find(b => b.bookingId === bookingId);

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancellationReason = cancellationReason;

    await client.save();

    res.status(200).json({ success: true, message: "Booking cancelled", data: booking });
  } catch (error) {
    console.error("❌ Error cancelling vehicle booking:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

module.exports = {
  createVehicleBooking,
  updateVehicleBooking,
  cancelVehicleBooking
};
