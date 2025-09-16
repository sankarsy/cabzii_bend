const fs = require("fs");
const Vehicle = require("../model/vehicleSchema");

// Auto-generate Vehicle ID
const generateVehicleId = async () => {
  const prefix = "VH";
  const count = await Vehicle.countDocuments();
  const padded = String(count + 1).padStart(4, "0");
  return `${prefix}${padded}`;
};

// 📌 Create Vehicle
const createVehicle = async (req, res) => {
  try {
    const { name, type, seoDescription, seoTitle } = req.body;
    const _id = await generateVehicleId();

    const imagePaths = req.files?.map((file) => `/uploads/${file.filename}`) || [];

    if (imagePaths.length > 3) {
      return res.status(400).json({ error: "You can upload up to 3 images only." });
    }

    const newVehicle = new Vehicle({
      _id,
      name,
      type,
      images: imagePaths,
      seoDescription,
      seoTitle,
      packages: [],
    });

    await newVehicle.save();
    res.status(201).json({ message: "Vehicle created", vehicle: newVehicle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// 📌 Update Vehicle
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    const newImages = req.files?.map((file) => `/uploads/${file.filename}`) || [];
    const total = vehicle.images.length + newImages.length;

    if (total > 3) {
      return res.status(400).json({ error: "Total images cannot exceed 3." });
    }

    if (newImages.length > 0) {
      vehicle.images.push(...newImages);
    }

    // Update fields if provided
    const fields = ["name", "type", "seoTitle", "seoDescription"];
    fields.forEach((field) => {
      if (updates[field] !== undefined) {
        vehicle[field] = updates[field];
      }
    });

    await vehicle.save();
    res.json({ message: "Vehicle updated", vehicle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 📌 Delete Vehicle
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    // Delete associated images
    vehicle.images.forEach((img) => {
      const fullPath = `.${img}`;
      fs.unlink(fullPath, (err) => {
        if (err) console.error("Error deleting image:", err);
      });
    });

    await Vehicle.findByIdAndDelete(id);
    res.json({ message: "Vehicle deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Add Package
const addPackage = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const packages = Array.isArray(req.body) ? req.body : [req.body];

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    for (const pkg of packages) {
      if (!pkg._id || !pkg._id.startsWith("PK")) {
        return res.status(400).json({ error: "Each Package ID must start with 'PK'" });
      }

      const exists = vehicle.packages.find((p) => p._id === pkg._id);
      if (exists) return res.status(400).json({ error: `Package ID ${pkg._id} already exists` });

      vehicle.packages.push(pkg);
    }

    await vehicle.save();
    res.status(200).json({ message: "Package(s) added", vehicle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// 📌 Get All Vehicles with Packages
const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 📌 Update Package
const updatePackage = async (req, res) => {
  try {
    const { vehicleId, packageId } = req.params;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    const pkg = vehicle.packages.id(packageId);
    if (!pkg) return res.status(404).json({ error: "Package not found" });

    Object.assign(pkg, req.body);
    await vehicle.save();

    res.json({ message: "Package updated", vehicle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Delete Package
const deletePackage = async (req, res) => {
  try {
    const { vehicleId, packageId } = req.params;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    vehicle.packages = vehicle.packages.filter((p) => p._id !== packageId);
    await vehicle.save();

    res.json({ message: "Package deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Delete one image from vehicle
const deleteImage = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { imagePath } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    if (!vehicle.images.includes(imagePath)) {
      return res.status(400).json({ error: "Image not found in vehicle" });
    }

    vehicle.images = vehicle.images.filter((img) => img !== imagePath);
    await vehicle.save();

    const fullPath = `.${imagePath}`;
    fs.unlink(fullPath, (err) => {
      if (err) console.error("Error deleting image file:", err);
    });

    res.json({ message: "Image removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 📌 Get Vehicle by ID
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findOne({ _id: id }); // ✅ custom string ID

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    res.status(200).json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ✅ Export all controller functions
module.exports = {
  createVehicle,
  updateVehicle,
  deleteVehicle,
  addPackage,
  updatePackage,
  deletePackage,
  deleteImage,
  getAllVehicles, // ✅ Export new function
  getVehicleById, // ✅ new export
};
