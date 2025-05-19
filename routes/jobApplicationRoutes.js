const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const jobApplicationController = require("../controllers/jobApplicationController");
const uploadPDF = require("../middleware/uploadPdfMiddleware");

const router = express.Router();


router.post(
  "/apply",
  verifyToken,
  uploadPDF.fields([
    { name: "cvDocument", maxCount: 1 },
    { name: "otherDocuments", maxCount: 5 },
  ]),
  jobApplicationController.applyForJob
);
router.get('/applicationsByJobId', verifyToken, jobApplicationController.getJobApplicationsByJobId);
// ✅ Update application status with strict rules
router.patch('/update-status-application', verifyToken, jobApplicationController.updateJobApplicationStatus);
router.get("/company/my-applicants", verifyToken, jobApplicationController.getApplicantsForCompanyJobs);


router.get("/:companyName/:jobTitle", verifyToken,jobApplicationController.getAllApplications);
router.get("/:applicationId", verifyToken,jobApplicationController.getApplication);
router.put("/:applicationId", verifyToken,jobApplicationController.editApplication);
router.delete("/:applicationId", verifyToken, jobApplicationController.deleteApplication);

module.exports = router;
