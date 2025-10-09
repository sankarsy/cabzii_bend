const express = require("express");
const router = express.Router();
const upload = require("../../storageconfig/StorageFile");
const {
  createCab,
  updateCab,
  deleteCab,
  getAllCabs,
  getCabById,
  getCabBySlug, // ✅ import new controller
  deleteCabImage,
} = require("../controller/cabController");

// Routes
router.post("/create", upload.array("cabImages", 3), createCab);
router.put("/update/:id", upload.array("cabImages", 3), updateCab);
router.delete("/delete/:id", deleteCab);
router.get("/getall", getAllCabs);
router.get("/get/:id", getCabById);

// ✅ Get cab by slug
router.get("/slug/:slug", getCabBySlug);

// Delete a single cab image
router.delete("/image/:cabId/:imageIndex", deleteCabImage);

module.exports = router;
