const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: String,
  duration: String,
  distance: Number,
  price: Number,
  offerPrice: Number,
  discount: Number,
});

const vehicleSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // ✅ important!
  name: String,
  type: String,
  images: [String],
  seoDescription: String,
  seoTitle: String,
  packages: [packageSchema],
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
