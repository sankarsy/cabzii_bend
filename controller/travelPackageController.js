const TravelPackage = require("../model/TravelPackageSchema");
const fs = require("fs");
const path = require("path");

// Create new travel package
const createTravelPackage = async (req, res) => {
  try {
    const { _id, name, category, seoTitle } = req.body;
    const image = req.file?.filename || null;

    // if (!image) {
    //   return res.status(400).json({ message: "Main image is required" });
    // }

    const newTravelPackage = new TravelPackage({
      _id,
      name,
      category,
      seoTitle: seoTitle || "",
      image,
    });

    const saved = await newTravelPackage.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create travel package",
      error: error.message,
    });
  }
};

// Get all travel packages
const getAllTravelPackages = async (req, res) => {
  try {
    const packages = await TravelPackage.find();
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single travel package by ID
const getTravelPackageById = async (req, res) => {
  try {
    const travelPackage = await TravelPackage.findById(req.params.id);
    if (!travelPackage)
      return res.status(404).json({ message: "Package not found" });
    res.json(travelPackage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update travel package
const updateTravelPackage = async (req, res) => {
  try {
    const packageId = req.params.id;
    const existingPackage = await TravelPackage.findById(packageId);
    if (!existingPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    const { name, category, seoTitle } = req.body;
    const newImage = req.file?.filename;

    if (newImage && existingPackage.image) {
      fs.unlink(path.join("uploads", existingPackage.image), (err) => {
        if (err) console.error("Failed to delete old main image:", err);
      });
    }

    const updated = await TravelPackage.findByIdAndUpdate(
      packageId,
      {
        name: name || existingPackage.name,
        category: category || existingPackage.category,
        seoTitle: seoTitle || existingPackage.seoTitle,
        image: newImage || existingPackage.image,
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Delete travel package
const deleteTravelPackage = async (req, res) => {
  try {
    const deleted = await TravelPackage.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Package not found" });

    // Optionally delete image file from server here if needed

    res.json({ message: "Package deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createTravelPackage,
  getAllTravelPackages,
  getTravelPackageById,
  updateTravelPackage,
  deleteTravelPackage,
};
