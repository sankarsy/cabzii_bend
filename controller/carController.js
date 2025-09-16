const Car = require("../model/carSchema");

// Get all cars
const getCars = async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cars" });
  }
};

// Get a single car by carid
const getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findOne({ carid: id }); // using carid (not _id)

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json(car);
  } catch (error) {
    console.error("Error fetching car:", error);
    res.status(500).json({ message: "Error fetching car", error });
  }
};

// Create new car
const createCar = async (req, res) => {
  try {
    const {
      carid,
      carname,
      price,
      hour,
      distance,
      description,
      offerprice,
      offerpercentage,
      seoTitle,
    } = req.body;

    const carimage = req.file ? `/uploads/${req.file.filename}` : "";

    const newCar = new Car({
      carid,
      carname,
      price,
      hour,
      distance,
      description,
      offerprice,
      offerpercentage,
      seoTitle,
      carimage,
    });

    await newCar.save();
    res.status(201).json(newCar);
  } catch (error) {
    res.status(500).json({ message: "Error adding car", error });
  }
};

// Update car
const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    const fields = [
      "carname",
      "price",
      "hour",
      "distance",
      "description",
      "offerprice",
      "offerpercentage",
      "seoTitle",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        car[field] = req.body[field];
      }
    });

    if (!car.carid) {
      return res.status(400).json({ message: "Carid is missing from existing data" });
    }

    if (req.file) {
      car.carimage = `/uploads/${req.file.filename}`;
    }

    await car.save();
    res.json(car);
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ message: "Error updating car", error: error.message });
  }
};

// Delete car
const deleteCar = async (req, res) => {
  try {
    const deletedCar = await Car.findByIdAndDelete(req.params.id);
    if (!deletedCar) return res.status(404).json({ message: "Car not found" });
    res.json({ message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting car", error });
  }
};

module.exports = {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
};
