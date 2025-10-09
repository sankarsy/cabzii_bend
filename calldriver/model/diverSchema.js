const mongoose = require("mongoose");
const slugify = require("slugify");

// ------------------ PACKAGE SCHEMA ------------------
const packageSchema = new mongoose.Schema(
  {
    _id: { type: String }, // e.g., "DP0001"
    title: { type: String, required: true },
    duration: String,
    distance: Number,
    price: Number,
    offerPrice: Number,
    discount: Number,
    extraKmCharge: Number,
    extraHourCharge: Number,
    accommodationRequired: { type: Boolean, default: false },

    // ✅ SEO
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },

    // ✅ Slug
    slug: { type: String, index: true },
  },
  { timestamps: true }
);

// Auto-generate slug for package
packageSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// ------------------ VEHICLE CATEGORY SCHEMA ------------------
const vehicleCategorySchema = new mongoose.Schema(
  {
    _id: { type: String }, // e.g., "CD0001"
    categoryName: { type: String, required: true },
    categoryType: String,
    categoryImage: [String], // images for category only

    // ✅ SEO
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },

    // ✅ Slug
    slug: { type: String, unique: true, index: true },

    packages: [packageSchema],
  },
  { timestamps: true }
);

// Auto-generate slug for category
vehicleCategorySchema.pre("save", function (next) {
  if (this.isModified("categoryName")) {
    this.slug = slugify(this.categoryName, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("CallDriver", vehicleCategorySchema);
