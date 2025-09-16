const express = require("express");
const upload = require("../storageconfig/StorageFile"); // ✅ Using shared multer config
const {
  getCars,
  createCar,
  updateCar,
  deleteCar,
  getCarById,
} = require("../controller/carController");

const router = express.Router();
router.get("/getCarById/:id", getCarById); // ✅ NEW endpoint
router.get("/getAllCar", getCars);                        // ➤ Get all cars
router.post("/createCar", upload.single("carimage"), createCar); // ➤ Create a car with image upload
router.put("/updateCar/:id", upload.single("carimage"), updateCar); // ➤ Update car + image
router.delete("/cars/:id", deleteCar); 

module.exports = router;
