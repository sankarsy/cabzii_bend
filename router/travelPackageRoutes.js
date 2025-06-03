const express = require("express");
const router = express.Router();
const upload = require("../storageconfig/StorageFile");

const {
  createTravelPackage,
  getAllTravelPackages,
  getTravelPackageById,
  updateTravelPackage,
  deleteTravelPackage,
} = require("../controller/travelPackageController");

// Only upload single main image for travel package
router.post(
  "/createTravelPackage",
  upload.single("image"),  // only main image now
  createTravelPackage
);

router.get("/getAllTravelPackages", getAllTravelPackages);
router.get("/getTravelPackageById/:id", getTravelPackageById);
router.put(
  "/updateTravelPackage/:id",
  upload.single("image"),
  updateTravelPackage
);
router.delete("/deleteTravelPackage/:id", deleteTravelPackage);

module.exports = router;
