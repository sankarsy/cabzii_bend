const fs = require("fs");
const TourPackage = require("../model/TourShema");

const generatePackageId = (count) => `TP${String(count).padStart(4, "0")}`;
const generateSubTourId = (count) => `TOUR${String(count).padStart(4, "0")}`;

// Create Main Tour Package
const createTourPackage = async (req, res) => {
  try {
    if (req.files && req.files.length > 3) {
      return res.status(400).json({ message: "Maximum 3 images allowed." });
    }

    const count = await TourPackage.countDocuments();
    const newId = generatePackageId(count + 1);

    const images = req.files?.map((file) => `/uploads/${file.filename}`) || [];

    const newPackage = new TourPackage({
      _id: newId,
      ...req.body,
      images,
    });

    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (error) {
    res.status(500).json({ message: "Error creating package", error });
  }
};


// Update Package
const updateTourPackage = async (req, res) => {
  try {
    const pkg = await TourPackage.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: "Package not found" });

    if (req.files && req.files.length > 0) {
      if ((pkg.images.length + req.files.length) > 3) {
        return res.status(400).json({ message: "Maximum 3 images allowed per package." });
      }

      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      pkg.images = [...pkg.images, ...newImages];
    }

    Object.assign(pkg, req.body, { updatedAt: new Date() });
    await pkg.save();
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ message: "Error updating package", error });
  }
};


// Delete Package
const deleteTourPackage = async (req, res) => {
  try {
    const pkg = await TourPackage.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: "Package not found" });

    if (pkg.images && pkg.images.length > 0) {
      pkg.images.forEach((imgPath) => {
        const filePath = `.${imgPath}`;
        fs.unlink(filePath, (err) => {
          if (err && err.code !== "ENOENT") {
            console.error("Error deleting image:", err);
          }
        });
      });
    }

    await TourPackage.findByIdAndDelete(req.params.id);
    res.json({ message: "Package deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting package", error });
  }
};


// Delete specific image from a package
const deletePackageImage = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { imagePath } = req.body;

    const pkg = await TourPackage.findById(packageId);
    if (!pkg) return res.status(404).json({ message: "Package not found" });

    pkg.images = pkg.images.filter((img) => img !== imagePath);
    await pkg.save();

    fs.unlink(`.${imagePath}`, (err) => {
      if (err && err.code !== "ENOENT") {
        console.error("Error deleting image file:", err);
      }
    });

    res.json({ message: "Image removed" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting image", error });
  }
};


// Get All Packages
const getAllTourPackages = async (req, res) => {
  try {
    const packages = await TourPackage.find();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching packages", error });
  }
};

// Get Package by ID
const getTourPackageById = async (req, res) => {
  try {
    const tourPackage = await TourPackage.findById(req.params.id);
    if (!tourPackage) return res.status(404).json({ message: "Tour Package not found" });
    res.json(tourPackage);
  } catch (error) {
    res.status(500).json({ message: "Error fetching package", error });
  }
};

// Get All SubTours
const getAllSubTours = async (req, res) => {
  try {
    const tourPackage = await TourPackage.findById(req.params.packageId);
    if (!tourPackage) return res.status(404).json({ message: "Package not found" });
    res.json(tourPackage.subTours);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sub-tours", error });
  }
};

// Get SubTour by ID
const getSubTourById = async (req, res) => {
  try {
    const { packageId, subTourId } = req.params;
    const tourPackage = await TourPackage.findById(packageId);
    if (!tourPackage) return res.status(404).json({ message: "Package not found" });

    const subTour = tourPackage.subTours.id(subTourId);
    if (!subTour) return res.status(404).json({ message: "Sub-tour not found" });

    res.json(subTour);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sub-tour", error });
  }
};



const addSubTour = async (req, res) => {
  try {
    const pkg = await TourPackage.findById(req.params.packageId);
    if (!pkg) return res.status(404).json({ message: "Package not found" });

    const newSubTour = {
      _id: generateSubTourId(pkg.subTours.length + 1),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (req.files && req.files.length) {
      newSubTour.image = req.files.map((f) => f.filename);
    }

    pkg.subTours.push(newSubTour);
    await pkg.save();
    res.status(201).json(newSubTour);
  } catch (error) {
    res.status(500).json({ message: "Error adding sub-tour", error });
  }
};

const updateSubTour = async (req, res) => {
  try {
    const { packageId, subTourId } = req.params;
    const pkg = await TourPackage.findById(packageId);
    if (!pkg) return res.status(404).json({ message: "Package not found" });
    const subTour = pkg.subTours.id(subTourId);
    if (!subTour) return res.status(404).json({ message: "Sub-tour not found" });

    Object.assign(subTour, req.body, { updatedAt: new Date() });
    if (req.files && req.files.length) {
      subTour.image = req.files.map((f) => f.filename);
    }

    await pkg.save();
    res.json(subTour);
  } catch (error) {
    res.status(500).json({ message: "Error updating sub-tour", error });
  }
};

const deleteSubTour = async (req, res) => {
  try {
    const { packageId, subTourId } = req.params;
    const pkg = await TourPackage.findById(packageId);
    if (!pkg) return res.status(404).json({ message: "Package not found" });
    const subTour = pkg.subTours.id(subTourId);
    if (!subTour) return res.status(404).json({ message: "Sub-tour not found" });

    pkg.subTours.pull(subTourId);
    await pkg.save();
    res.json({ message: "Sub-tour deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting sub-tour", error });
  }
};



module.exports = {
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
  deleteSubTour,
};
