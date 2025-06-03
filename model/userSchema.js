const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstname: { type: String },
    lastname: { type: String },
    mobile: { type: Number },
    password: { type: String },
    otp: { type: Number },
    otptimestamp: { type: Number },
    otpVerified: { type: Boolean, default: false },
    resetAttempts: { type: Number, default: 0 },
   
})


const userModel = mongoose.model('User', userSchema);

module.exports = userModel;