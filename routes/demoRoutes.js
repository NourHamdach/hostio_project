const express = require("express");
const router = express.Router();
const demoController = require("../controllers/demoController");
const {verifyToken, AdminverifyToken} = require("../middleware/authMiddleware"); // Optional: secure confirm/cancel

// 🔹 Get available time slots for a selected date
router.get("/available-slots", demoController.getAvailableSlots);

// 🔹 Book a demo (no auth required)
router.post("/book",verifyToken, demoController.bookDemo);

// 🔹 Confirm a demo (protected)
router.post("/confirm/:demoId",AdminverifyToken ,demoController.confirmDemo);

// 🔹 Cancel a demo (protected)
router.post("/cancel/:demoId",AdminverifyToken ,demoController.cancelDemo);
// ✅ Mark a demo as done (admin only)
router.post("/done/:demoId", AdminverifyToken, demoController.markDemoAsDone);

router.get("/admin/companies-with-done-demo-Unverified", AdminverifyToken, demoController.getUnverifiedCompaniesWithDoneDemo);

// Verify a company (only by admin and if demo is done)
router.patch("/verify/:companyId", AdminverifyToken, demoController.verifyCompany);


router.get("/by-date", AdminverifyToken, demoController.getDemosByDate);
router.get("/by-status", AdminverifyToken, demoController.getDemosByStatus);
router.post("/calendar/block-slot",AdminverifyToken,demoController.blockTimeSlot);
router.get("/all", AdminverifyToken, demoController.getAllDemos);
// 🔐 Set job limit before verification
router.patch("/admin/job-limit", AdminverifyToken, demoController.setJobLimit);
router.get("/admin/verified", AdminverifyToken, demoController.getAllVerifiedCompanies);
router.get("/RecruitmentNeeds", demoController.getAllRecruitmentNeeds);

router.get("/available-slots/week", AdminverifyToken, demoController.getAvailableSlotsForWeek);

// Get a single demo by ID
router.get("/:demoId", AdminverifyToken,demoController.getDemoById);

module.exports = router;
