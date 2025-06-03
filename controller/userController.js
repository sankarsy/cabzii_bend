const userModel = require('../model/userSchema');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const secret_Key = "ABCDEF";

// User creation
const userCreate = async (req, res) => {
    const { firstname, lastname, mobile, password } = req.body;

    if (!firstname || !lastname || !mobile || !password) {
        return res.json({ status: 0, message: "All fields are required!" });
    }

    const checkMobile = await userModel.findOne({ mobile });
    if (checkMobile) {
        return res.json({ status: 0, message: "Mobile number already exists" });
    }

    const hashpassword = await bcrypt.hash(password, 10);
    const newUser = { firstname, lastname, mobile, password: hashpassword };

    try {
        const createuser = await userModel.create(newUser);
        if (!createuser) {
            res.json({ status: 0, message: "Error while User Creting" });
        }
        res.json({ status: 1, message: "User created successfully!" });
    } catch (error) {
        console.error("Error creating user:", error);
        res.json({ status: 0, message: "User creation failed!" });
    }
};

// Login
const login = async (req, res) => {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
        return res.json({ status: 0, message: "Mobile and password are required!" });
    }

    const checkUser = await userModel.findOne({ mobile });
    if (!checkUser) {
        return res.json({ status: 0, message: "Invalid user" });
    }

    const checkpassword = await bcrypt.compare(password, checkUser.password);
    if (checkpassword) {
        const token = jwt.sign(
            { userId: checkUser._id, mobile: checkUser.mobile },
            secret_Key,
            { expiresIn: '1hr' }
        );
        res.json({ status: 1, message: 'Login successful', token });
    } else {
        res.json({ status: 0, message: 'Invalid password' });
    }
};

// Forgot Password
const forgotpassword = async (req, res) => {
    const { mobile } = req.body;

    if (!mobile) {
        return res.json({ status: 0, message: "Mobile number is required!" });
    }

    const checkUser = await userModel.findOne({ mobile });
    if (!checkUser) {
        return res.json({ status: 0, message: "User not found" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    const otptimestamp = Date.now() + 300000; // OTP valid for 5 minutes

    try {
        await userModel.findByIdAndUpdate(
            checkUser._id,
            { otp, otptimestamp, otpVerified: false }
        );

        // Send OTP via email (mocked for now)
        const subject = 'OTP verification for password reset';
        const content = `Your OTP is ${otp}. This OTP is valid for 5 minutes.`;
        console.log(`${subject}Email sent to ${mobile}: ${content}`); // Replace with email sending logic

        res.json({ status: 1, message: `OTP sent successfully to ${mobile} ${otp}` });
    } catch (error) {
        console.error("Error generating OTP:", error);
        res.json({ status: 0, message: "Failed to generate OTP" });
    }
};

// Verify OTP
const verifyotp = async (req, res) => {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
        return res.json({ status: 0, message: "Mobile and OTP are required!" });
    }

    const checkUser = await userModel.findOne({ mobile });
    if (!checkUser) {
        return res.json({ status: 0, message: "User not found" });
    }

    if (checkUser.otptimestamp < Date.now()) {
        return res.json({ status: 0, message: "Your OTP has expired" });
    }

    if (parseInt(otp) !== checkUser.otp) {
        return res.json({ status: 0, message: "Invalid OTP" });
    }

    try {
        await userModel.findByIdAndUpdate(checkUser._id, { otpVerified: true });
        res.json({ status: 1, message: "OTP verified successfully" });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.json({ status: 0, message: "Failed to verify OTP" });
    }
};

// Reset Password
const resetpassword = async (req, res) => {
    const { mobile, newpassword, confirmpassword } = req.body;

    if (!mobile || !newpassword || !confirmpassword) {
        return res.json({ status: 0, message: "All fields are required!" });
    }

    const checkUser = await userModel.findOne({ mobile });
    if (!checkUser) {
        return res.json({ status: 0, message: "User not found" });
    }

    if (!checkUser.otpVerified) {
        return res.json({ status: 0, message: "OTP verification is required!" });
    }

    if (newpassword !== confirmpassword) {
        return res.json({ status: 0, message: "Passwords do not match!" });
    }

    try {
        const hashpassword = await bcrypt.hash(newpassword, 10);
        await userModel.findByIdAndUpdate(checkUser._id, {
            password: hashpassword,
            otpVerified: false,
            otp: null,
            otptimestamp: null
        });

        res.json({ status: 1, message: "Password reset successfully!" });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.json({ status: 0, message: "Failed to reset password" });
    }
};

// error not using await
const logout = async (req, res) => {
    res.json({ status: 1, message: 'Logout succesful!' })
}

module.exports = { userCreate, login, forgotpassword, verifyotp, resetpassword, logout };
