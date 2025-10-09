const mongoose = require("mongoose");
const slugify = require("slugify");

const tourPackageListSchema = new mongoose.Schema(
  {
    _id: { type: String }, // custom string ID e.g., SUBTOUR0001
    title: { type: String, required: true, trim: true },
    category: { type: String, default: "" },
    image: { type: String, default: "" },
    packagePrice: { type: Number, default: 0, min: 0 },
    offerPrice: { type: Number, default: 0, min: 0 },
    packageDiscount: { type: Number, default: 0, min: 0 },

    // SEO fields
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },

    slug: { type: String, unique: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, _id: false } // _id false since using custom IDs
);

// Auto-generate slug for sub-tour
tourPackageListSchema.pre("save", function (next) {
  if (this.isModified("title") || !this.slug) {
    this.slug = slugify(this.title || "", { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("TourPackageList", tourPackageListSchema);
