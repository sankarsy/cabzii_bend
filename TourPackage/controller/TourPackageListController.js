const fs = require("fs");
const path = require("path");
const SubTour = require("../model/TourPackageListSchema");

// ---------------- ID Generator ----------------
const generateSubTourId = async () => {
  const count = await SubTour.countDocuments();
  return `SUBTOUR${String(count + 1).padStart(4, "0")}`;
};

// ---------------- Helper to delete file safely ----------------
const deleteFile = (filePath) => {
  if (!filePath) return;
  const absolutePath = path.join(__dirname, "..", filePath.replace(/^\/+/, "")); // remove leading slashes

  fs.unlink(absolutePath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Error deleting file:", absolutePath, err);
    }
  });
};

// ---------------- CREATE SUBTOUR ----------------
const createSubTour = async (req, res) => {
  try {
    const newId = await generateSubTourId();
    const subTourData = {
      _id: newId,
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : "",
    };

    const newSubTour = new SubTour(subTourData);
    await newSubTour.save();

    res.status(201).json(newSubTour);
  } catch (err) {
    console.error("Error creating sub-tour:", err);
    res.status(500).json({ message: "Error creating sub-tour", error: err.message });
  }
};

// ---------------- UPDATE SUBTOUR ----------------
const updateSubTour = async (req, res) => {
  try {
    const subTour = await SubTour.findById(req.params.id);
    if (!subTour) return res.status(404).json({ message: "Sub-tour not found" });

    // Handle image replacement
    if (req.file) {
      if (subTour.image) {
        deleteFile(subTour.image);
      }
      subTour.image = `/uploads/${req.file.filename}`;
    }

    // Update allowed fields
    const allowedFields = [
      "title",
      "category",
      "packagePrice",
      "offerPrice",
      "packageDiscount",
      "seoTitle",
      "seoDescription",
      "isActive",
      "slug", // optional (add if needed)
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) subTour[field] = req.body[field];
    });

    subTour.updatedAt = new Date();
    await subTour.save();

    res.json(subTour);
  } catch (err) {
    console.error("Error updating sub-tour:", err);
    res.status(500).json({ message: "Error updating sub-tour", error: err.message });
  }
};

// ---------------- DELETE SUBTOUR ----------------
const deleteSubTour = async (req, res) => {
  try {
    const subTour = await SubTour.findById(req.params.id);
    if (!subTour) return res.status(404).json({ message: "Sub-tour not found" });

    if (subTour.image) {
      deleteFile(subTour.image);
    }

    await SubTour.findByIdAndDelete(req.params.id);
    res.json({ message: "Sub-tour deleted successfully" });
  } catch (err) {
    console.error("Error deleting sub-tour:", err);
    res.status(500).json({ message: "Error deleting sub-tour", error: err.message });
  }
};

// ---------------- GET ALL SUBTOURS ----------------
const getAllSubTours = async (req, res) => {
  try {
    const subTours = await SubTour.find().sort({ createdAt: -1 });
    res.json(subTours);
  } catch (err) {
    console.error("Error fetching sub-tours:", err);
    res.status(500).json({ message: "Error fetching sub-tours", error: err.message });
  }
};

// ---------------- GET SUBTOUR BY ID ----------------
const getSubTourById = async (req, res) => {
  try {
    const subTour = await SubTour.findById(req.params.id);
    if (!subTour) return res.status(404).json({ message: "Sub-tour not found" });
    res.json(subTour);
  } catch (err) {
    console.error("Error fetching sub-tour:", err);
    res.status(500).json({ message: "Error fetching sub-tour", error: err.message });
  }
};

// ---------------- GET SUBTOUR BY SLUG ----------------
const getSubTourBySlug = async (req, res) => {
  try {
    const subTour = await SubTour.findOne({ slug: req.params.slug });
    if (!subTour) return res.status(404).json({ message: "Sub-tour not found" });
    res.json(subTour);
  } catch (err) {
    console.error("Error fetching sub-tour by slug:", err);
    res.status(500).json({ message: "Error fetching sub-tour by slug", error: err.message });
  }
};

module.exports = {
  createSubTour,
  updateSubTour,
  deleteSubTour,
  getAllSubTours,
  getSubTourById,
  getSubTourBySlug,
};
