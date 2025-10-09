const express = require("express");
const router = express.Router();
const upload = require("../../storageconfig/StorageFile");

const {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
} = require("../controller/TourController");

// -------------------- Test Route --------------------
router.get("/test", (req, res) => res.json({ message: "Tour route working!" }));

// -------------------- CATEGORY ROUTES --------------------
// Create category
router.post("/create", upload.single("image"), createCategory);
// Update category
router.put("/update/:id", upload.single("image"), updateCategory);
// Delete category
router.delete("/delete/:id", deleteCategory);
// Get all categories
router.get("/getAll", getAllCategories);
// Get category by ID
router.get("/get/:id", getCategoryById);
// Get category by slug
router.get("/getBySlug/:slug", getCategoryBySlug);

module.exports = router;
