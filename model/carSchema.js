const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  carid: { type: String, required: true, unique: true }, // Custom Car ID
  carname: { type: String },
  carimage: { type: String },
  distance: { type: String },
  price: { type: String },
  offerprice: { type: String },
  offerpercentage: { type: String },
  description: { type: String },
  seoTitle: { type: String },
});

const Car = mongoose.model("Car", carSchema);
module.exports = Car;
