const express = require ("express")
const {userCreate,login,forgotpassword,verifyotp,resetpassword,logout} = require('../controller/userController')
const router = express.Router();

router.route("/userCreate").post(userCreate);
router.route("/login").post(login);
router.route("/forgotpassword").post(forgotpassword);
router.route("/verifyotp").post(verifyotp);
router.route("/resetpassword").post(resetpassword);
router.route("/logout").post(logout);


module.exports = router;