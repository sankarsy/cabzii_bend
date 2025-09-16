const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  carid: { type: String, required: true, unique: true }, // Custom Car ID
  carname: { type: String },
  carimage: { type: String },
  distance: { type: String },
  price: { type: String },
  hour: { type: String }, // ✅ New field added here
  offerprice: { type: String },
  offerpercentage: { type: String },
  description: { type: String },
  seoTitle: { type: String },
});

const Car = mongoose.model("Car", carSchema);
module.exports = Car;
// This schema defines the structure of a car document in the MongoDB database.
// It includes fields for car ID, name, image, distance, price, hourly rate, offer price, offer percentage, description, and SEO title.