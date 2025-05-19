const express = require("express");
const router = express.Router();
const adminAuthController = require("../controllers/AuthAdminController");

// Auth
router.post("/register", adminAuthController.registerAdmin);
router.post("/login", adminAuthController.loginAdmin);

// Stats
router.get("/stats/users-by-country", adminAuthController.getUserCountByCountry);
router.get("/stats/users-per-month", adminAuthController.getUsersPerMonth);
router.get("/stats/registered-users", adminAuthController.getRegisteredUsersStats);
router.get("/stats/verified-companies", adminAuthController.getVerifiedCompaniesStats);
router.get("/stats/premium-vs-regular", adminAuthController.getPremiumVsNonPremium);
router.get("/stats/jobs-by-status", adminAuthController.getJobsByStatus);
router.get("/stats/jobs-per-month", adminAuthController.getJobsPerMonth);
router.get("/stats/active-companies", adminAuthController.getActiveCompanies);
router.get("/stats/jobseekers-open-to-work", adminAuthController.getJobSeekerOpenToWorkStats);
router.get("/stats/top-countries-by-applications", adminAuthController.getTopCountriesByApplications);


module.exports = router;
