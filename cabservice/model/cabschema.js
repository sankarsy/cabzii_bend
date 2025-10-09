const mongoose = require("mongoose");
const slugify = require("slugify");

const cabSchema = new mongoose.Schema(
  {
    name: String,
    type: String,

    // Auto-generated custom ID like CAB0001
    cabId: {
      type: String,
      unique: true,
    },

    // SEO-friendly slug (e.g., "innova-crysta")
    slug: {
      type: String,
      unique: true,
    },

    cabImages: [String],

    package: {
      oneWay: {
        price: Number,
        offerPrice: Number,
        discount: Number,
        coverage: Number,
        extraKms: Number,
        bata: Number,
      },
      roundTrip: {
        price: Number,
        offerPrice: Number,
        discount: Number,
        coverage: Number,
        extraKms: Number,
        bata: Number,
      },
    },

    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true }
);

// 🔑 Auto-generate slug from name when saving
cabSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Cab = mongoose.model("Cab", cabSchema);

module.exports = Cab;
