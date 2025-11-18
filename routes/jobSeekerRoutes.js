const express = require("express");
const jobSeekerController= require("../controllers/jobSeekerController");
const uploadPdf = require("../middleware/uploadPdfMiddleware");
const { verifyToken } = require("../middleware/authMiddleware");
const {verifyCompanyPremium,verifyPremiumOrAdmin }= require("../middleware/verifyCompanyPremium");
const router = express.Router();
router.get("/", jobSeekerController.getAllJobSeekers); 
router.get("/my-applications",verifyToken,jobSeekerController.getMyJobApplications); 
//preferences
router.post("/JobseekerPreferences",verifyToken,jobSeekerController.setJobSeekerPreferences); 
router.get("/Mypreferences", verifyToken, jobSeekerController.getMyJobPreferences);
router.get("/preferences-durations", jobSeekerController.getAllDurations);
//Experiences
router.post("/experience",verifyToken,jobSeekerController.addProfessionalExperience);
router.get("/experiences/me", verifyToken, jobSeekerController.getMyProfessionalExperiences);
router.get("/Myexperience-by-id", verifyToken,jobSeekerController.getMyExperienceById);
router.get("/experiences-Of-Jobseeker", verifyToken, verifyPremiumOrAdmin,jobSeekerController.getAllExperiencesOfjobSeekerById);
router.put("/edit-experience", verifyToken, jobSeekerController.editProfessionalExperience);
router.delete("/delete-experience", verifyToken, jobSeekerController.deleteProfessionalExperience);
// languages
router.post("/update-languages", verifyToken, jobSeekerController.addJobSeekerLanguages);
router.delete("/Deletelanguage",verifyToken,jobSeekerController.deleteJobSeekerLanguage);
//Education
router.post("/add-education", verifyToken, jobSeekerController.addEducation);
router.put('/edit-education', verifyToken, jobSeekerController.updateEducation);
router.get('/Myeducations', verifyToken, jobSeekerController.getMyEducations);
router.get('/get-education-by-id', verifyToken, jobSeekerController.getEducationById);
router.delete("/education", verifyToken, jobSeekerController.deleteEducationById);
router.post('/add-Personal-info', verifyToken, jobSeekerController.addNationalitiesAndInfo)

//skill
router.post("/add-skills", verifyToken, jobSeekerController.addJobSeekerSkills);
router.get("/get-skills", verifyToken, jobSeekerController.getMySkills);
router.delete("/delete-skill", verifyToken, jobSeekerController.deleteMySkill);
// Nationalities
router.get('/nationalities', jobSeekerController.getAllNationalities);

// Skills
router.get('/skills', jobSeekerController.getAllSkills);



router.put("/email", verifyToken, jobSeekerController.updateEmail);
router.put("/username", verifyToken, jobSeekerController.updateUsername);
router.put("/headline", verifyToken, jobSeekerController.updateProfessionalHeadline);
router.put("/about", verifyToken, jobSeekerController.updateAboutMe);
router.delete("/about", verifyToken, jobSeekerController.deleteAboutMe);
router.put("/location", verifyToken, jobSeekerController.updateLocation);
router.put("/phone", verifyToken, jobSeekerController.updatePhone);
router.get("/Myprofile/full", verifyToken, jobSeekerController.getMyFullJobSeekerProfile);
//savedJobs
router.post("/saved-jobs", verifyToken, jobSeekerController.saveJob);             // body: { jobId }
router.delete("/saved-jobs", verifyToken, jobSeekerController.unsaveJob);  // param: jobId

router.get("/saved-jobs", verifyToken, jobSeekerController.getSavedJobsForJobSeeker);

router.get("/universities", jobSeekerController.getAllUniversities);


// ✅ Route for Resume Upload (PDF)
router.post("/upload-resume", verifyToken, uploadPdf.single("resume"), jobSeekerController.uploadResume);
router.get("/:jobSeekerId", jobSeekerController.getJobSeekerByjobSeekerId);
router.delete("/:userId", jobSeekerController.deleteJobSeeker); 
module.exports = router;