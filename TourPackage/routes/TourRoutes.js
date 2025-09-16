const express = require("express");
const router = express.Router();
const upload = require("../../storageconfig/StorageFile");

const {
  createTourPackage,
  updateTourPackage,
  deleteTourPackage,
  deletePackageImage,
  getAllTourPackages,
  getTourPackageById,
  getAllSubTours,
  getSubTourById,
  addSubTour,
  updateSubTour,
  deleteSubTour
} = require("../controller/TourController");

router.get("/test", (req, res) => {
  res.json({ message: "Tour route working!" });
});

// Create new tour package (with image upload)
router.post("/createpackage", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "packageImage", maxCount: 1 },
]), createTourPackage);

// Update existing tour package (with image upload)
router.put("/update/:id", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "packageImage", maxCount: 1 },
]), updateTourPackage);


router.get("/getAllPackages", getAllTourPackages);
router.get("/getPackage/:id", getTourPackageById);
router.delete("/delete/:id", deleteTourPackage);


router.post("/:packageId/createSubTour", upload.single("image"), addSubTour);
router.put("/:packageId/updateSubTour/:subTourId", upload.single("image"), updateSubTour);
router.get("/:packageId/getAllSubTours", getAllSubTours);
router.get("/:packageId/getSubTour/:subTourId", getSubTourById);
router.delete("/:packageId/deleteSubTour/:subTourId", deleteSubTour);

module.exports = router;
