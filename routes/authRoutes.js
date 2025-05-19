const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController"); // ✅ Ensure correct import

// Authentication Routes
//router.post("/register/:role", authController.registerWithEmail);
router.post("/register/company", authController.registerCompany);
router.post("/register/jobseeker", authController.registerJobSeeker);
// API to verify OTP (Uses `POST` with userId & email in URL)
router.post("/verify-otp/:userId/:email", authController.verifyOTP);
router.get("/google/:role", authController.googleAuthRedirect);
router.get("/google/callback/:role", authController.googleAuthCallback);
router.post("/send-otp/:email", authController.sendOTP);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
module.exports = router; // ✅ Ensure the router is exported correctly
