const fs = require("fs");
const Cab = require("../model/cabschema");

// Helper function to generate cabId in format CAB0001, CAB0002, etc.
async function generateCabId() {
  const lastCab = await Cab.findOne().sort({ createdAt: -1 });
  if (!lastCab || !lastCab.cabId) {
    return "CAB0001";
  }
  const lastId = parseInt(lastCab.cabId.replace("CAB", ""));
  const newId = (lastId + 1).toString().padStart(4, '0');
  return "CAB" + newId;
}

// Create a new cab
const createCab = async (req, res) => {
  try {
    const { name,type, seoTitle, seoDescription, package } = req.body;
    const cabImages = req.files ? req.files.map(file => file.path) : [];
    const cabId = await generateCabId();

    const newCab = new Cab({
      name,
      type,
      cabId,
      cabImages,
      seoTitle,
      seoDescription,
      package: package ? JSON.parse(package) : {}
    });

    await newCab.save();
    res.status(201).json({ message: "Cab created successfully", cab: newCab });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a cab
const updateCab = async (req, res) => {
  try {
    const cabId = req.params.id;
    const updates = req.body;

    if (req.files && req.files.length > 0) {
      updates.cabImages = req.files.map(file => file.path);
    }
    if (updates.package) {
      updates.package = JSON.parse(updates.package);
    }

    const updatedCab = await Cab.findByIdAndUpdate(cabId, updates, { new: true });

    if (!updatedCab) {
      return res.status(404).json({ error: "Cab not found" });
    }

    res.json({ message: "Cab updated successfully", cab: updatedCab });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a cab
const deleteCab = async (req, res) => {
  try {
    const cabId = req.params.id;
    const deletedCab = await Cab.findByIdAndDelete(cabId);

    if (!deletedCab) {
      return res.status(404).json({ error: "Cab not found" });
    }

    if (deletedCab.cabImages && deletedCab.cabImages.length > 0) {
      deletedCab.cabImages.forEach(filePath => {
        fs.unlink(filePath, err => {
          if (err) console.error(`Failed to delete image ${filePath}:`, err.message);
        });
      });
    }

    res.json({ message: "Cab deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all cabs
const getAllCabs = async (req, res) => {
  try {
    const cabs = await Cab.find().sort({ createdAt: -1 });
    res.json({ cabs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get cab by ID
const getCabById = async (req, res) => {
  try {
    const cabId = req.params.id;
    const cab = await Cab.findById(cabId);

    if (!cab) {
      return res.status(404).json({ error: "Cab not found" });
    }

    res.json(cab);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCab,
  updateCab,
  deleteCab,
  getAllCabs,
  getCabById, // ✅ new export
};

