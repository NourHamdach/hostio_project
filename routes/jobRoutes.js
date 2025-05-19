const express = require("express");
const { verifyToken,AdminverifyToken } = require("../middleware/authMiddleware");
const jobController = require("../controllers/jobController");

const router = express.Router();

router.post("/", verifyToken,jobController.createJob); 
router.get("/contract-types",jobController.getAllContractTypes);
router.get("/job-statuses", jobController.getAllJobStatuses);
router.get("/by-status",jobController.getJobsByStatus);
router.get("/by-method",jobController.getJobsByApplicationMethod);
router.get("/by-Start-date", jobController.getJobsByStartDate);
router.get("/by-Created-date", jobController.getJobsByCreatedAt);
router.get("/all",jobController.getAllJobs);
router.get("/all-details",jobController.getAllJobDetails);
router.get("/jobs_by_CompanyId",jobController.getJobsByCompanyId);
router.get("/my-jobs", verifyToken, jobController.getMyCompanyJobs);

router.get("/languages", jobController.getAllLanguages);
router.get("/departments", jobController.getAllDepartments);
router.patch("/close", verifyToken, jobController.closeJob);
router.patch("/make-open", verifyToken,jobController.makeJobOpen);
router.patch("/admin/reject", AdminverifyToken, jobController.rejectJobByAdmin);
router.get("/admin/rejected", AdminverifyToken, jobController.getAllRejectedJobs);

router.put("/:jobId", verifyToken,jobController.editJob);
router.delete("/:jobId", verifyToken, jobController.deleteJob);

router.get("/:jobId",verifyToken,jobController.getJobById);


module.exports = router;
