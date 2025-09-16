const mongoose = require("mongoose");

// Package Schema (nested)
const packageSchema = new mongoose.Schema(
  {
    _id: { type: String }, // e.g., "DP0001"
    title: String,
    duration: String,
    distance: Number,
    price: Number,
    offerPrice: Number,
    discount: Number,
    extraKmCharge: Number,
    extraHourCharge: Number,
    accommodationRequired: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Vehicle Category Schema
const vehicleCategorySchema = new mongoose.Schema(
  {
    _id: { type: String }, // e.g., "CD0001"
    categoryName: String,
    categoryType: String,
    categoryImage: [String], // only categories can have images
    seoTitle: String,
    seoDescription: String,
    packages: [packageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CallDriver", vehicleCategorySchema);
