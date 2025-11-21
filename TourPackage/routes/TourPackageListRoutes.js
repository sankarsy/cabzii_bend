  const express = require("express");
  const router = express.Router();
  const upload = require("../../storageconfig/StorageFile"); // Multer config

  const {
    createSubTour,
    updateSubTour,
    deleteSubTour,
    getAllSubTours,
    getSubTourById,
    getSubTourBySlug,
  } = require("../controller/TourPackageListController");

  // -------------------- Test Route --------------------
  router.get("/test", (req, res) => res.json({ message: "SubTour route working!" }));

  // -------------------- SUBTOUR ROUTES --------------------
  // Create a new SubTour
  router.post("/create", upload.single("image"), createSubTour);

  // Update an existing SubTour by ID
  router.put("/update/:id", upload.single("image"), updateSubTour);

  // Delete a SubTour by ID
  router.delete("/delete/:id", deleteSubTour);

  // Get all SubTours
  router.get("/getAll", getAllSubTours);

  // Get a SubTour by ID
  router.get("/get/:id", getSubTourById);

  // Get a SubTour by slug
  router.get("/getBySlug/:slug", getSubTourBySlug);

  module.exports = router;
