// controllers/clientController.js
const axios = require("axios");
const jwt = require("jsonwebtoken");
const clientModel = require("../model/clientSchema");

/* ───────────── Env ───────────── */
const SECRET_KEY = process.env.JWT_SECRET || "ABCDEF";
const FAST2SMS_API_KEY =
  process.env.FAST2SMS_API_KEY ||
  "kg0BcsP3e52VqmxrQd2uAc9zoNhzzHmtNK8EHaRWB70Q3HH4Wh3q4SaLkAw8"; // 🔑
const OTP_VALIDITY_MINUTES = 2;

/* ───────────── Memory Stores ───────────── */
const OTP_STORE = new Map();
const LAST_SENT = new Map();

/* ───────────── Helpers ───────────── */
const extractToken = (req) =>
  req.headers.authorization?.split(" ")[1] || null;

function normalizeIndianMobile(mobile) {
  const digits = String(mobile).replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits;
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("0") && digits.length === 11)
    return `91${digits.slice(1)}`;
  throw new Error("Invalid mobile format");
}

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit
}

/* ───────────── Send OTP ───────────── */
const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res
        .status(400)
        .json({ status: 0, message: "Mobile number is required" });
    }

    const now = Date.now();
    const last = LAST_SENT.get(String(mobile)) || 0;
    if (now - last < 30 * 1000) {
      const wait = Math.ceil((30 * 1000 - (now - last)) / 1000);
      return res.status(429).json({
        status: 0,
        message: `Please wait ${wait}s before requesting another OTP`,
      });
    }

    const to = normalizeIndianMobile(mobile);
    const otp = generateOtp();

    // Fast2SMS API
    const url = "https://www.fast2sms.com/dev/bulkV2";
    const payload = {
      route: "q", // Quick SMS
      message: `Your OTP for Cabzii login is ${otp}. It is valid for ${OTP_VALIDITY_MINUTES} minutes.`,
      language: "english",
      flash: 0,
      numbers: to.replace(/^91/, ""), // Fast2SMS expects 10-digit
    };

    const { data } = await axios.post(url, payload, {
      headers: {
        authorization: FAST2SMS_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!data || data.return !== true) {
      return res
        .status(502)
        .json({ status: 0, message: "Failed to send OTP", info: data });
    }

    OTP_STORE.set(String(mobile), {
      otp,
      expiresAt: now + OTP_VALIDITY_MINUTES * 60 * 1000,
    });
    LAST_SENT.set(String(mobile), now);

    return res.json({
      status: 1,
      message: "OTP sent via Fast2SMS",
    });
  } catch (err) {
    console.error("sendOtp error:", err.response?.data || err.message);
    return res
      .status(500)
      .json({ status: 0, message: "Internal error while sending OTP" });
  }
};

/* ───────────── Verify OTP ───────────── */
const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) {
      return res
        .status(400)
        .json({ status: 0, message: "Mobile and OTP are required" });
    }

    const key = String(mobile);
    const stored = OTP_STORE.get(key);
    if (!stored) {
      return res
        .status(400)
        .json({ status: 0, message: "OTP not sent. Please try again." });
    }

    if (stored.expiresAt < Date.now()) {
      OTP_STORE.delete(key);
      return res.status(400).json({ status: 0, message: "OTP has expired" });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ status: 0, message: "Invalid OTP" });
    }

    let client = await clientModel.findOne({ mobile: key });
    const isNew = !client;

    if (isNew) {
      client = await clientModel.create({
        mobile: key,
        firstname: "",
        lastname: "",
        identity: "",
        email: "",
        address1: "",
        address2: "",
        landmark: "",
        city: "",
        state: "",
        zip: "",
        cabBookings: [],
        tourBookings: [],
        driverBookings: [],
      });
    }

    const token = jwt.sign(
      { clientId: client._id, mobile: client.mobile },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    OTP_STORE.delete(key);

    return res.status(isNew ? 201 : 200).json({
      status: 1,
      message: "Client logged in successfully",
      token,
      client: {
        _id: client._id,
        mobile: client.mobile,
        firstname: client.firstname,
        lastname: client.lastname,
        identity: client.identity,
        email: client.email,
        address1: client.address1,
        address2: client.address2,
        landmark: client.landmark,
        city: client.city,
        state: client.state,
        zip: client.zip,
      },
    });
  } catch (err) {
    console.error("verifyOtp error:", err.response?.data || err.message);
    return res
      .status(500)
      .json({ status: 0, message: "Failed to verify OTP" });
  }
};

/* ───────────── Get Profile ───────────── */
const getClientProfile = async (req, res) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ status: 0, message: "No token provided" });
  }

  try {
    const { clientId } = jwt.verify(token, SECRET_KEY);
    const client = await clientModel.findById(clientId).select("-__v");
    if (!client) {
      return res.status(404).json({ status: 0, message: "Client not found" });
    }
    return res.json({ status: 1, client });
  } catch (err) {
    console.error("JWT error:", err);
    return res
      .status(401)
      .json({ status: 0, message: "Invalid or expired token" });
  }
};

/* ───────────── Update Profile ───────────── */
const updateClientProfile = async (req, res) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ status: 0, message: "No token provided" });
  }

  try {
    const { clientId } = jwt.verify(token, SECRET_KEY);
    const updated = await clientModel.findByIdAndUpdate(clientId, req.body, {
      new: true,
      runValidators: true,
    });

    return res.json({ status: 1, message: "Profile updated", client: updated });
  } catch (err) {
    console.error("Update error:", err);
    return res
      .status(500)
      .json({ status: 0, message: "Failed to update profile" });
  }
};

/* ───────────── Get All Bookings ───────────── */
const getBookings = async (req, res) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ status: 0, message: "No token provided" });
  }

  try {
    const { clientId } = jwt.verify(token, SECRET_KEY);
    const client = await clientModel
      .findById(clientId)
      .select("cabBookings tourBookings driverBookings");

    if (!client) {
      return res.status(404).json({ status: 0, message: "Client not found" });
    }

    return res.json({
      status: 1,
      bookings: {
        cab: client.cabBookings,
        tour: client.tourBookings,
        driver: client.driverBookings,
      },
    });
  } catch (err) {
    console.error("Booking fetch error:", err);
    return res
      .status(500)
      .json({ status: 0, message: "Failed to fetch bookings" });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  getClientProfile,
  updateClientProfile,
  getBookings,
};
