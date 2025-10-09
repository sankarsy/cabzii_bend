const mongoose = require("mongoose");
const slugify = require("slugify");

const tourPackageSchema = new mongoose.Schema(
  {
    _id: { type: String }, // custom string ID e.g., TOUR0001
    name: { type: String, required: true },
    category: { type: String, default: "" },
    image: { type: String, default: "" },
    maxDiscount: { type: Number, default: 0 },

    // SEO fields
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },

    slug: { type: String, unique: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate slug for package
tourPackageSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name || "", { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("TourPackage", tourPackageSchema);
