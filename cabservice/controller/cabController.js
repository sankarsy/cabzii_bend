const fs = require("fs");
const Cab = require("../model/cabschema");

// Helper: generate cabId
async function generateCabId() {
  const lastCab = await Cab.findOne().sort({ createdAt: -1 });
  if (!lastCab || !lastCab.cabId) return "CAB0001";
  const lastId = parseInt(lastCab.cabId.replace("CAB", ""));
  const newId = (lastId + 1).toString().padStart(4, "0");
  return "CAB" + newId;
}

// Create Cab
const createCab = async (req, res) => {
  try {
    const { name, type, seoTitle, seoDescription } = req.body;
    let pkg = {};
    if (req.body.package) {
      try {
        pkg = JSON.parse(req.body.package);
      } catch {
        return res.status(400).json({ error: "Invalid package format" });
      }
    }

    const cabImages = req.files ? req.files.map(file => file.path) : [];
    const cabId = await generateCabId();

    // ✅ Generate slug automatically
    const slugify = require("slugify");
    const slug = slugify(name, { lower: true, strict: true });

    const newCab = new Cab({ name, type, cabId, slug, cabImages, seoTitle, seoDescription, package: pkg });
    await newCab.save();
    res.status(201).json({ message: "Cab created successfully", cab: newCab });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Cab
const updateCab = async (req, res) => {
  try {
    const cabId = req.params.id;
    const updates = { ...req.body };

    if (req.files && req.files.length > 0) {
      updates.cabImages = req.files.map(file => file.path);
    }

    if (updates.package) {
      try {
        updates.package = JSON.parse(updates.package);
      } catch {
        return res.status(400).json({ error: "Invalid package format" });
      }
    }

    // ✅ Update slug if name changed
    if (updates.name) {
      const slugify = require("slugify");
      updates.slug = slugify(updates.name, { lower: true, strict: true });
    }

    const updatedCab = await Cab.findByIdAndUpdate(cabId, updates, { new: true });
    if (!updatedCab) return res.status(404).json({ error: "Cab not found" });

    res.json({ message: "Cab updated successfully", cab: updatedCab });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Cab
const deleteCab = async (req, res) => {
  try {
    const cabId = req.params.id;
    const deletedCab = await Cab.findByIdAndDelete(cabId);
    if (!deletedCab) return res.status(404).json({ error: "Cab not found" });

    deletedCab.cabImages?.forEach(path => {
      fs.unlink(path, err => err && console.error(`Failed to delete ${path}: ${err.message}`));
    });

    res.json({ message: "Cab deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Cabs
const getAllCabs = async (req, res) => {
  try {
    const cabs = await Cab.find().sort({ createdAt: -1 });
    res.json({ cabs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Cab by ID
const getCabById = async (req, res) => {
  try {
    const cab = await Cab.findById(req.params.id);
    if (!cab) return res.status(404).json({ error: "Cab not found" });
    res.json(cab);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Cab by Slug
const getCabBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const cab = await Cab.findOne({ slug });
    if (!cab) return res.status(404).json({ error: "Cab not found" });
    res.json(cab);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a single cab image
const deleteCabImage = async (req, res) => {
  try {
    const { cabId, imageIndex } = req.params;
    const cab = await Cab.findById(cabId);

    if (!cab) return res.status(404).json({ error: "Cab not found" });
    if (!cab.cabImages || !cab.cabImages[imageIndex])
      return res.status(400).json({ error: "Image not found" });

    const removedImage = cab.cabImages.splice(imageIndex, 1)[0];
    fs.unlink(removedImage, err => {
      if (err) console.error(`Failed to delete image ${removedImage}:`, err.message);
    });

    await cab.save();
    res.json({ message: "Image deleted successfully", cab });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createCab, updateCab, deleteCab, getAllCabs, getCabById, getCabBySlug, deleteCabImage };
