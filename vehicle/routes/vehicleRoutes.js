const express = require("express");
const router = express.Router();
const upload = require("../../storageconfig/StorageFile");

const {
  createVehicle,
  updateVehicle,
  deleteVehicle,
  addPackage,
  updatePackage,
  deletePackage,
  deleteImage,
  getAllVehicles,
  getVehicleById,
  getVehicleBySlug, // ✅ Added
} = require("../controller/vehicleController");

// ✅ TEST ROUTE
router.get("/test", (req, res) => {
  res.json({ message: "✅ Vehicle route working!" });
});

// ---------------- VEHICLE CRUD ----------------
router.post("/createvehicle", upload.array("images", 3), createVehicle);
router.put("/updatevehicle/:id", upload.array("images", 3), updateVehicle);
router.get("/getAllVehicles", getAllVehicles);
router.get("/getvehicle/:id", getVehicleById);
router.get("/getvehiclebyslug/:slug", getVehicleBySlug); // ✅ SEO-friendly slug route
router.delete("/deletevehicle/:id", deleteVehicle);

// ---------------- PACKAGE CRUD ----------------
router.post("/:vehicleId/createpkg", addPackage);
router.put("/:vehicleId/updatepkg/:packageId", updatePackage);
router.delete("/:vehicleId/deletepkg/:packageId", deletePackage);

// ---------------- IMAGE CRUD ----------------
router.delete("/:vehicleId/image", deleteImage);

module.exports = router;
