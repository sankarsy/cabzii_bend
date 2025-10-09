  const mongoose = require("mongoose");
  const slugify = require("slugify");

  // ---------------- PACKAGE SCHEMA ----------------
  const packageSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // e.g., PK0001
    title: { type: String, required: true }, // e.g., "4 Hours / 40 Kms"
    duration: String,
    distance: Number,
    price: Number,
    offerPrice: Number,
    discount: Number,

    // SEO-friendly slug for package
    slug: {
      type: String,
      index: true,
    },
  });

  // 🔑 Auto-generate slug for package
  packageSchema.pre("save", function (next) {
    if (this.isModified("title")) {
      this.slug = slugify(this.title, { lower: true, strict: true });
    }
    next();
  });

  // ---------------- VEHICLE SCHEMA ----------------
  const vehicleSchema = new mongoose.Schema(
    {
      _id: { type: String, required: true }, // e.g., VH0001
      name: { type: String, required: true }, // e.g., "Innova Crysta"
      type: String,
      images: [String],

      // SEO-friendly slug for vehicle
      slug: {
        type: String,
        unique: true,
        index: true,
      },

      seoTitle: String,
      seoDescription: String,

      packages: [packageSchema], // embedded packages
    },
    { timestamps: true }
  );

  // 🔑 Auto-generate slug for vehicle
  vehicleSchema.pre("save", function (next) {
    if (this.isModified("name")) {
      this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
  });

  module.exports = mongoose.model("Vehicle", vehicleSchema);
