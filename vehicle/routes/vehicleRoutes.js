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
  getAllVehicles, // ✅ New function to get all vehicles
  getVehicleById, // ✅ New function to get vehicle by ID
} = require("../controller/vehicleController");

// ✅ TEST ROUTE
router.get("/test", (req, res) => {
  res.json({ message: "✅ Vehicle route working!" });
});

router.post("/createvehicle", upload.array("images", 3), createVehicle);
router.put("/updatevehicle/:id", upload.array("images", 3), updateVehicle);
router.get("/getAllVehicles", getAllVehicles);
router.delete("/deletevehicle/:id", deleteVehicle);
router.post("/:vehicleId/createpkg", addPackage);
router.put("/:vehicleId/updatepkg/:packageId", updatePackage);
router.delete("/:vehicleId/deletepkg/:packageId", deletePackage);
router.delete("/:vehicleId/image", deleteImage);
// Get vehicle by ID
router.get("/getvehicle/:id", getVehicleById);

module.exports = router;
