const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  firstname: String,
  lastname: String,
  identity: String, // male or female
  email: String,
  address1: String,
  address2: String,
  landmark: String,
  city: String,
  state: String,
  zip: String,

  vehicleBookings: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      bookingId: String, // e.g. VEH00001
      vehicleId: String,
      vehicleIdName: String,
      vehicleType: String, // fixed/custom
      packageName: String,
      price: Number,
      offerPrice: Number,
      discountPercentage: Number,
      pickup: {
        doorNo: String,
        street: String,
        landmark: String,
        city: String,
        state: String,
        zip: String,
        date: Date,
        time: String
      },
      contact: {
        contactName: String,
        contactPhone: String,
        contactEmail: String
      },
      clientNote: String,
      totalFare: Number,
      paymentMethod: { type: String, default: "pay_on_ride" },
      paymentStatus: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
      },
      transactionId: String,
      status: {
        type: String,
        enum: ["booked", "ongoing", "completed", "cancelled"],
        default: "booked"
      },
      rideCompletedAt: Date,
      cancelledAt: Date,
      cancellationReason: String,
      isRefunded: { type: Boolean, default: false },
      refundAmount: { type: Number, default: 0 },
      refundProcessedAt: Date
    }
  ],

  tourBookings: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      bookingId: String, // e.g. TOUR00001
      packageName: String,
      subTourName: String,
      price: Number,
      offerPrice: Number,
      discountPercentage: Number,
      packageType: String, // fixed/custom
      pickup: {
        doorNo: String,
        street: String,
        landmark: String,
        city: String,
        state: String,
        zip: String,
        date: Date,
        time: String
      },
      contact: {
        contactName: String,
        contactPhone: String,
        contactEmail: String
      },
      members: [
        {
          name: String,
          age: Number,
          gender: String
        }
      ],
      clientNote: String,
      totalFare: Number,
      paymentMethod: { type: String, default: "pay_on_ride" },
      paymentStatus: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
      },
      transactionId: String,
      status: {
        type: String,
        enum: ["booked", "ongoing", "completed", "cancelled"],
        default: "booked"
      },
      rideCompletedAt: Date,
      cancelledAt: Date,
      cancellationReason: String,
      isRefunded: { type: Boolean, default: false },
      refundAmount: { type: Number, default: 0 },
      refundProcessedAt: Date
    }
  ],

  driverBookings: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      bookingId: String, // e.g. drivercar00001
      categoryId: String,
      categoryName: String,
      categoryType: String,
      packageName: String,
      price: Number,
      offerPrice: Number,
      discountPercentage: Number,
      pickup: {
        doorNo: String,
        street: String,
        landmark: String,
        city: String,
        state: String,
        zip: String,
        date: Date,
        time: String
      },
      contact: {
        contactName: String,
        contactPhone: String,
        contactEmail: String
      },
      clientNote: String,
      totalFare: Number,
      paymentMethod: { type: String, default: "pay_on_ride" },
      paymentStatus: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
      },
      transactionId: String,
      status: {
        type: String,
        enum: ["booked", "ongoing", "completed", "cancelled"],
        default: "booked"
      },
      rideCompletedAt: Date,
      cancelledAt: Date,
      cancellationReason: String,
      isRefunded: { type: Boolean, default: false },
      refundAmount: { type: Number, default: 0 },
      refundProcessedAt: Date
    }
  ],

 cabRentals: [
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    bookingId: String,
    cabId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cab",
      required: true
    },
    cabName: String,
    packageType: String,
    cabpackage: String,
    price: Number,
    offerPrice: Number,
    discountPercentage: Number,
    pickup: {
      doorNo: String,
      street: String,
      landmark: String,
      city: String,
      state: String,
      zip: String,
      date: Date,
      time: String
    },
    contact: {
      contactName: String,
      contactPhone: String,
      contactEmail: String
    },
    cabType: String,
    bookingValue: { type: Number, required: true },
    couponCode: String,
    bookingTime: {
      type: Date,
      default: Date.now
    },
    cancellation: {
      reason: String,
      cancelledAt: Date,
      cancelTime: Date,
      isRefunded: { type: Boolean, default: false },
      refundAmount: { type: Number, default: 0 },
      refundProcessedAt: Date
    },
    status: {
      type: String,
      enum: ["booked", "ongoing", "completed", "cancelled"],
      default: "booked"
    },
    paymentMethod: {
      type: String,
      enum: ["pay_on_ride", "upi", "card"],
      default: "pay_on_ride"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending"
    },
    transactionId: String
  }
]


}, { timestamps: true });

module.exports = mongoose.model("Client", clientSchema);
