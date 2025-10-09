const express = require("express");
const router = express.Router();
const upload = require("../../storageconfig/StorageFile"); // ✅ multer config

const {
  createVehicleCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,          // ✅ new
  updateVehicleCategory,
  deleteVehicleCategory,
  addPackageToCategory,
  updatePackageInCategory,
  deletePackageFromCategory,
  getAllPackagesFromCategory,
  getPackageById,
  getPackageBySlug,           // ✅ new
} = require("../controller/driverController");

// ================= VEHICLE CATEGORY ROUTES =================

// Create category (image upload optional)
router.post("/create", upload.array("categoryImage", 3), createVehicleCategory);

// Get all categories
router.get("/getAll", getAllCategories);

// Get single category by ID
router.get("/get/:id", getCategoryById);

// Get category by slug (SEO)
router.get("/getBySlug/:slug", getCategoryBySlug);

// Update category (image upload optional)
router.put("/update/:id", upload.array("categoryImage", 3), updateVehicleCategory);

// Delete category
router.delete("/delete/:id", deleteVehicleCategory);

// ================= PACKAGE ROUTES =================

// Add package to a category
router.post("/categories/:categoryId/createpackage", addPackageToCategory);

// Get all packages in a category
router.get("/categories/:categoryId/allpackages", getAllPackagesFromCategory);

// Get single package by ID
router.get("/categories/:categoryId/packages/:packageId", getPackageById);

// Get package by slug (SEO)
router.get("/categories/:categorySlug/packages/:packageSlug", getPackageBySlug);

// Update package
router.put("/categories/:categoryId/packages/update/:packageId", updatePackageInCategory);

// Delete package
router.delete("/categories/:categoryId/packages/delete/:packageId", deletePackageFromCategory);

module.exports = router;
