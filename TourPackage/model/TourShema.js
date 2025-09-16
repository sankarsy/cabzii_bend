// models/TravelPackage.js

const mongoose = require('mongoose');

// Sub-tour schema
const TourSchema = new mongoose.Schema({
  _id: { type: String, required: true },               // Unique identifier for sub-tour
  packageName: { type: String, required: true },       // Name of the sub-tour
  category: { type: String },                          // Sub-tour category
  seoTitle: { type: String, default: '' },             // SEO title
  description: { type: String },                       // Description
  image: [{ type: String }],                           // Multiple images
  packagePrice: { type: Number, default: 0 },
  offerPrice: { type: Number, default: 0 },
  packageDiscount: { type: Number, default: 0 },       // % or amount, calculate dynamically if needed
  isActive: { type: Boolean, default: true },          // Optional: to soft-hide sub-tour
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Main travel package schema
const TourPackageSchema = new mongoose.Schema({
  _id: { type: String, required: true },               // Unique ID for the main package
  name: { type: String, required: true },              // Main package name (e.g., Local Tour)
  category: { type: String },                          // e.g., Local, Business, Devotional
  image: { type: String },                             // Main image (banner)
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String },
  maxDiscount: { type: Number, default: 0 },
  subTours: [TourSchema],                           // Nested sub-tour array
  isFeatured: { type: Boolean, default: false },       // Optional: for showing on homepage highlights
  isActive: { type: Boolean, default: true },          // Optional: to soft-hide entire package
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TourPackage', TourPackageSchema);
