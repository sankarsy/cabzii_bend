// controllers/tourController.js
const fs = require("fs");
const path = require("path");
const TourPackage = require("../model/TourShema"); // ✅ Ensure path is correct

// ---------------- ID Generator ----------------
const generateTourId = (count) => `TOUR${String(count).padStart(4, "0")}`;

// ---------------- TOUR PACKAGE CONTROLLERS ----------------

// Create Tour Package
const createCategory = async (req, res) => {
  try {
    const count = await TourPackage.countDocuments();
    const newId = generateTourId(count + 1);

    const newCategory = new TourPackage({
      _id: newId,
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : "",
    });

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Error creating category", error });
  }
};

// Update Tour Package
const updateCategory = async (req, res) => {
  try {
    const category = await TourPackage.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    if (req.file) {
      if (category.image) {
        fs.unlink(path.join(".", category.image), (err) => {
          if (err && err.code !== "ENOENT") console.error(err);
        });
      }
      category.image = `/uploads/${req.file.filename}`;
    }

    const allowedFields = ["name", "category", "seoTitle", "seoDescription", "maxDiscount", "isActive"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "maxDiscount") category[field] = Number(req.body[field]);
        else if (field === "isActive") category[field] = req.body[field] === "true" || req.body[field] === true;
        else category[field] = req.body[field];
      }
    });

    category.updatedAt = new Date();
    await category.save();
    res.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Error updating category", error });
  }
};

// Delete Tour Package
const deleteCategory = async (req, res) => {
  try {
    const category = await TourPackage.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    if (category.image) {
      fs.unlink(path.join(".", category.image), (err) => {
        if (err && err.code !== "ENOENT") console.error(err);
      });
    }

    await TourPackage.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Error deleting category", error });
  }
};

// Get All Categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await TourPackage.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

// Get Category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await TourPackage.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Error fetching category", error });
  }
};

// Get Category by Slug
const getCategoryBySlug = async (req, res) => {
  try {
    const category = await TourPackage.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    res.status(500).json({ message: "Error fetching category by slug", error });
  }
};

// ---------------- EXPORTS ----------------
module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
};
