const fs = require("fs");
const Vehicle = require("../model/vehicleSchema");

// -------------------- Helper: Generate Vehicle ID --------------------
const generateVehicleId = async () => {
  const prefix = "VH";
  const count = await Vehicle.countDocuments();
  const padded = String(count + 1).padStart(4, "0");
  return `${prefix}${padded}`;
};

// -------------------- CREATE VEHICLE --------------------
const createVehicle = async (req, res) => {
  try {
    const { name, type, seoDescription, seoTitle } = req.body;
    const _id = await generateVehicleId();

    // Accept up to 3 images
    const imagePaths = req.files?.map((file) => `/uploads/${file.filename}`) || [];
    if (imagePaths.length > 3) {
      return res.status(400).json({ error: "You can upload up to 3 images only." });
    }

    const newVehicle = new Vehicle({
      _id,
      name,
      type,
      images: imagePaths,
      seoTitle: seoTitle || `${name} - Cabzii`,
      seoDescription: seoDescription || `Book ${name} cab online. Choose from packages for hours or kms.`,
      packages: [],
    });

    await newVehicle.save();

    res.status(201).json({
      message: "Vehicle created",
      vehicle: formatVehicleForSEO(newVehicle),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- UPDATE VEHICLE --------------------
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    const newImages = req.files?.map((file) => `/uploads/${file.filename}`) || [];
    const totalImages = vehicle.images.length + newImages.length;
    if (totalImages > 3) {
      return res.status(400).json({ error: "Total images cannot exceed 3." });
    }
    if (newImages.length > 0) vehicle.images.push(...newImages);

    ["name", "type", "seoTitle", "seoDescription"].forEach((field) => {
      if (updates[field] !== undefined) vehicle[field] = updates[field];
    });

    await vehicle.save();
    res.json({ message: "Vehicle updated", vehicle: formatVehicleForSEO(vehicle) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- DELETE VEHICLE --------------------
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    // Delete images
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

// -------------------- ADD PACKAGE --------------------
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
    res.status(200).json({ message: "Package(s) added", vehicle: formatVehicleForSEO(vehicle) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- UPDATE PACKAGE --------------------
const updatePackage = async (req, res) => {
  try {
    const { vehicleId, packageId } = req.params;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    const pkg = vehicle.packages.id(packageId);
    if (!pkg) return res.status(404).json({ error: "Package not found" });

    Object.assign(pkg, req.body);
    await vehicle.save();
    res.json({ message: "Package updated", vehicle: formatVehicleForSEO(vehicle) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- DELETE PACKAGE --------------------
const deletePackage = async (req, res) => {
  try {
    const { vehicleId, packageId } = req.params;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    vehicle.packages = vehicle.packages.filter((p) => p._id !== packageId);
    await vehicle.save();
    res.json({ message: "Package deleted", vehicle: formatVehicleForSEO(vehicle) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- DELETE SINGLE IMAGE --------------------
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

// -------------------- GET ALL VEHICLES (SEO-READY) --------------------
const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    const seoVehicles = vehicles.map(formatVehicleForSEO);
    res.status(200).json(seoVehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- GET VEHICLE BY ID --------------------
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    res.status(200).json(formatVehicleForSEO(vehicle));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- GET VEHICLE BY SLUG --------------------
const getVehicleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const vehicle = await Vehicle.findOne({ slug });
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    res.status(200).json(formatVehicleForSEO(vehicle));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- Helper: Format Vehicle for SEO --------------------
const formatVehicleForSEO = (vehicle) => {
  return {
    _id: vehicle._id,
    name: vehicle.name,
    type: vehicle.type,
    images: vehicle.images,
    slug: vehicle.slug,
    seoTitle: vehicle.seoTitle,
    seoDescription: vehicle.seoDescription,
    packages: vehicle.packages.map((pkg) => ({
      _id: pkg._id,
      title: pkg.title,
      duration: pkg.duration,
      distance: pkg.distance,
      price: pkg.price,
      offerPrice: pkg.offerPrice,
      discount: pkg.discount,
      slug: pkg.slug,
    })),
  };
};

// -------------------- EXPORT --------------------
module.exports = {
  createVehicle,
  updateVehicle,
  deleteVehicle,
  addPackage,
  updatePackage,
  deletePackage,
  deleteImage,
  getAllVehicles,
  getVehicleById,
  getVehicleBySlug,
};
