const fs = require("fs");
const slugify = require("slugify");
const CallDriver = require("../model/diverSchema");

// Generate IDs
const generateCategoryId = async () => {
  const count = await CallDriver.countDocuments();
  return `CD${String(count + 1).padStart(4, "0")}`;
};

const generatePackageId = (category) =>
  `DP${String(category.packages.length + 1).padStart(4, "0")}`;

// ================= Vehicle Category Controllers =================

// Create Category
const createVehicleCategory = async (req, res) => {
  try {
    const { categoryType, categoryName, seoTitle, seoDescription } = req.body;
    const categoryImage = req.files?.map((f) => `/uploads/${f.filename}`) || [];

    const slug = slugify(categoryName || "category", { lower: true, strict: true });

    const newCategory = new CallDriver({
      _id: await generateCategoryId(),
      categoryType: categoryType || "",
      categoryName: categoryName || "",
      seoTitle: seoTitle || "",
      seoDescription: seoDescription || "",
      categoryImage,
      slug,
      packages: [],
    });

    await newCategory.save();
    res.status(201).json({ success: true, message: "Category created", data: newCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Category
const updateVehicleCategory = async (req, res) => {
  try {
    const category = await CallDriver.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    const { categoryType, categoryName, seoTitle, seoDescription } = req.body;

    if (typeof categoryType !== "undefined") category.categoryType = categoryType;
    if (typeof categoryName !== "undefined") {
      category.categoryName = categoryName;
      category.slug = slugify(categoryName, { lower: true, strict: true }); // update slug
    }
    if (typeof seoTitle !== "undefined") category.seoTitle = seoTitle;
    if (typeof seoDescription !== "undefined") category.seoDescription = seoDescription;

    if (req.files?.length > 0) {
      category.categoryImage = req.files.map((f) => `/uploads/${f.filename}`);
    }

    await category.save();
    res.json({ success: true, message: "Category updated", data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Category
const deleteVehicleCategory = async (req, res) => {
  try {
    const category = await CallDriver.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    if (category.categoryImage?.length) {
      category.categoryImage.forEach((imgPath) => {
        fs.unlink(`.${imgPath}`, (err) => {
          if (err && err.code !== "ENOENT") console.error(err);
        });
      });
    }

    await CallDriver.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= Package Controllers =================

// Add Package
const addPackageToCategory = async (req, res) => {
  try {
    const category = await CallDriver.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    const title = req.body.title || "Package";
    const slug = slugify(title, { lower: true, strict: true });

    const newPackage = {
      _id: generatePackageId(category),
      title,
      slug,
      duration: req.body.duration || "",
      distance: req.body.distance || 0,
      price: req.body.price || 0,
      offerPrice: req.body.offerPrice || 0,
      discount: req.body.discount || 0,
      extraKmCharge: req.body.extraKmCharge || 0,
      extraHourCharge: req.body.extraHourCharge || 0,
      accommodationRequired: req.body.accommodationRequired || false,
      seoTitle: req.body.seoTitle || "",
      seoDescription: req.body.seoDescription || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    category.packages.push(newPackage);
    await category.save();

    res.status(201).json({ success: true, message: "Package added", data: newPackage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Package
const updatePackageInCategory = async (req, res) => {
  try {
    const category = await CallDriver.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    const pkg = category.packages.id(req.params.packageId);
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });

    if (req.body.title) {
      pkg.title = req.body.title;
      pkg.slug = slugify(req.body.title, { lower: true, strict: true }); // update slug
    }

    // Update other fields
    Object.assign(pkg, req.body, { updatedAt: new Date() });

    await category.save();
    res.json({ success: true, message: "Package updated", data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Package
const deletePackageFromCategory = async (req, res) => {
  try {
    const category = await CallDriver.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    const pkg = category.packages.id(req.params.packageId);
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });

    category.packages.pull({ _id: req.params.packageId });

    await category.save();
    res.json({ success: true, message: "Package deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= Getters =================

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await CallDriver.find();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await CallDriver.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get category by slug (SEO)
const getCategoryBySlug = async (req, res) => {
  try {
    const category = await CallDriver.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all packages in a category
const getAllPackagesFromCategory = async (req, res) => {
  try {
    const category = await CallDriver.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, data: category.packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get package by ID
const getPackageById = async (req, res) => {
  try {
    const category = await CallDriver.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    const pkg = category.packages.id(req.params.packageId);
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });

    res.json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get package by slug (SEO)
const getPackageBySlug = async (req, res) => {
  try {
    const category = await CallDriver.findOne({ slug: req.params.categorySlug });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    const pkg = category.packages.find((p) => p.slug === req.params.packageSlug);
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });

    res.json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createVehicleCategory,
  updateVehicleCategory,
  deleteVehicleCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  addPackageToCategory,
  updatePackageInCategory,
  deletePackageFromCategory,
  getAllPackagesFromCategory,
  getPackageById,
  getPackageBySlug,
};
