const express = require("express");
const router = express.Router();
const {
  adminRegister,
  adminLogin,
  adminGetProfile,
  adminLogout,
  adminResetPassword
} = require("../controllers/userController"); // ✅ make sure the file is userController.js
const verifyToken = require("../middleware/authMiddleware");

// Test route
router.get("/admin/test", (req, res) => {
  res.json({ message: "Admin route working!" });
});

// Admin auth routes
router.post("/admin/register", adminRegister);
router.post("/admin/login", adminLogin);
router.get("/admin/profile", verifyToken, adminGetProfile);
router.post("/admin/logout", adminLogout);
router.post("/admin/reset-password", adminResetPassword);

module.exports = router;
