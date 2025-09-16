const AdminUser = require('../models/userModel'); // change if your model name is different
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret_Key = process.env.JWT_SECRET || 'ABCDEF';

// Admin Registration
const adminRegister = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ status: 0, message: "Email and password are required!" });
    }

    const existingUser = await AdminUser.findOne({ email });
    if (existingUser) {
        return res.json({ status: 0, message: "User already exists!" });
    }

    const hashpassword = await bcrypt.hash(password, 10);
    const newUser = { email, password: hashpassword, role: "admin" };

    try {
        const createUser = await AdminUser.create(newUser);
        if (!createUser) {
            return res.json({ status: 0, message: "Error while creating admin user" });
        }
        res.json({ status: 1, message: "Admin registered successfully!" });
    } catch (error) {
        console.error("Admin registration error:", error);
        res.json({ status: 0, message: "Registration failed!" });
    }
};

// Admin Login
const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ status: 0, message: "Email and password are required!" });
    }

    const checkUser = await AdminUser.findOne({ email });
    if (!checkUser) {
        return res.json({ status: 0, message: "Invalid user!" });
    }

    const checkpassword = await bcrypt.compare(password, checkUser.password);
    if (!checkpassword) {
        return res.json({ status: 0, message: "Invalid password!" });
    }

    const token = jwt.sign(
        { userId: checkUser._id, role: checkUser.role || 'admin' },
        secret_Key,
        { expiresIn: '1h' }
    );

    res.json({
        status: 1,
        message: "Admin login successful!",
        token,
        user: { email: checkUser.email, role: checkUser.role || 'admin' }
    });
};

// Admin Profile
const adminGetProfile = async (req, res) => {
    try {
        const user = await AdminUser.findById(req.user.userId).select('-password');
        if (!user) {
            return res.json({ status: 0, message: "Admin not found!" });
        }
        res.json({ status: 1, user });
    } catch (error) {
        console.error("Admin profile error:", error);
        res.json({ status: 0, message: "Failed to fetch profile!" });
    }
};

// Admin Logout
const adminLogout = async (req, res) => {
    res.json({ status: 1, message: 'Admin logout successful!' });
};

// Admin Reset Password
const adminResetPassword = async (req, res) => {
    const { email, newpassword, confirmpassword } = req.body;

    if (!email || !newpassword || !confirmpassword) {
        return res.json({ status: 0, message: "All fields are required!" });
    }

    const checkAdmin = await AdminUser.findOne({ email });
    if (!checkAdmin) {
        return res.json({ status: 0, message: "Admin not found!" });
    }

    if (newpassword !== confirmpassword) {
        return res.json({ status: 0, message: "Passwords do not match!" });
    }

    try {
        const hashedPassword = await bcrypt.hash(newpassword, 10);
        await AdminUser.findByIdAndUpdate(checkAdmin._id, {
            password: hashedPassword
        });

        res.json({ status: 1, message: "Password reset successfully!" });
    } catch (error) {
        console.error("Error resetting admin password:", error);
        res.json({ status: 0, message: "Failed to reset password!" });
    }
};

module.exports = {
    adminRegister,
    adminLogin,
    adminGetProfile,
    adminLogout,
    adminResetPassword
};
