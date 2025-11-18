// ✅ Define JOB_STATUSES constants
const JOB_STATUSES = {
  OPEN: 1,
  CLOSED: 2,
  EXPIRED: 3,
  DRAFT: 4,
  REJECTED: 5,
  DELETED: 6
};

const {
  Job,
  JobLanguage,
  ContractType,
  Department,
  JobDepartment,
  JobRecruiterContact,
  Language,
  Company,
  StatusJob,
  JobExternalLink,
  ContractDuration,
  MinimumSeniority
} = require("../models");
const JobApplication=require("../models/jobRelations/JobApplication")
const JobSeeker = require("../models/Jobseeker");
const cloudinary = require("../config/cloudinary");
const User=require("../models/User")
const Country = require("../models/CompanyRelations/CompanyLocations/Country");
const City = require("../models/CompanyRelations/CompanyLocations/City");
const JobSeekerSkills = require("../models/JobseekerRelations/Skills/JobseekerSkills");
const { Op } = require("sequelize");
// Experience
const JobseekerExperience = require("../models/JobseekerRelations/JobseekerExperience");

// Education
const JobseekerEducation = require("../models/JobseekerRelations/Educations/JobseekerEducations");

// Preferences
const JobPreference = require("../models/JobseekerRelations/JobPreferences/JobPreferences");
const ContractDurationPreference = require("../models/JobseekerRelations/JobPreferences/ContractDurationPreference");
const JobPreferenceLocation = require("../models/JobseekerRelations/JobPreferences/JobPreferenceLocation");

// Languages & Nationalities
const JobSeekerLanguage = require("../models/JobseekerRelations/JobSeekerLanguage");
const Nationality = require("../models/JobseekerRelations/Nationality");
const JobSeekerNationality = require("../models/JobseekerRelations/JobSeekerNationality");
const JobSeekerWorkPermit = require("../models/JobseekerRelations/JobSeekerWorkPermit");
const { sendApplicationStatusUpdateEmail } = require("../services/emailService");
const { v4: uuidv4 } = require('uuid');
const sanitize = (str) => str.replace(/\s+/g, " ").trim();

exports.editApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const updates = req.body;

    const application = await JobApplication.findByPk(applicationId);
    if (!application) return res.status(404).json({ message: "Application not found" });

    const allowedFields = ["status", "availability"];
    const updatePayload = {};

    for (const key of allowedFields) {
      if (key in updates) {
        updatePayload[key] = updates[key];
      }
    }

    await application.update(updatePayload);
    res.json(application);
  } catch (error) {
    console.error("Error in editApplication:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // 1. Find the application
    const application = await JobApplication.findByPk(applicationId, {
      include: [
        {
          model: JobSeeker,
          as: "jobseeker",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["username", "imageUrl"],
              include: [
                { model: Country, as: "country", attributes: ["countryName"] },
                { model: City, as: "city", attributes: ["cityName"] }
              ]
            },
            {
              model: JobSeekerSkills,
              as: "skills",
              attributes: ["skillName"]
            },
            {
              model: JobseekerExperience,
              as: "experiences",
              include: [
                { model: City, as: "city", attributes: ["cityName"] },
                { model: Country, as: "country", attributes: ["countryName"] },
                { model: Department, as: "department", attributes: ["departmentName"] }
              ]
            },
            {
              model: JobseekerEducation,
              as: "educations",
              include: [
                { model: City, as: "city", attributes: ["cityName"] },
                { model: Country, as: "country", attributes: ["countryName"] }
              ]
            },
            {
              model: JobPreference,
              as: "preferences",
              include: [
                { model: ContractType, as: "contractTypes", attributes: ["contractTypeId", "type"] },
                { model: ContractDurationPreference, as: "durations", attributes: ["durationId", "name"] },
                { model: Department, as: "departments", attributes: ["departmentId", "departmentName"] },
                {
                  model: JobPreferenceLocation,
                  as: "locations",
                  include: [
                    { model: City, as: "city", attributes: ["cityId", "cityName"] },
                    { model: Country, as: "country", attributes: ["countryId", "countryName"] }
                  ]
                }
              ]
            },
            {
              model: Language,
              as: "languages",
              through: { attributes: ["level"] },
              attributes: ["languageId", "languageName"]
            },
            {
              model: Nationality,
              as: "nationalities",
              attributes: ["nationalityId", "nationalityName"]
            },
            {
              model: JobSeekerWorkPermit,
              as: "workPermits",
              include: [
                { model: Country, as: "country", attributes: ["countryId", "countryName"] }
              ]
            }
          ]
        },
        {
          model: Job,
          as: "job",
          attributes: ["jobId", "numberOfPositions"] // ✅ Include job info
        }
      ],
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const jobId = application.jobId;

    // 2. Count how many hired applications exist for the same job
    const hiredApplicationsCount = await JobApplication.count({
      where: {
        jobId: jobId,
        status: "Hired"
      }
    });

    // 3. Get number of positions from the job
    const numberOfPositions = application.job?.numberOfPositions || null;

    // 4. Return full profile + counts
    res.json({
      ...application.get(),
      otherDocuments: application.otherDocuments
        ? application.otherDocuments.split(",").map((doc) => doc.trim())
        : [],
      hiredApplicationsCount,
      numberOfPositions
    });

  } catch (error) {
    console.error("Error in getApplication:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};


exports.getAllApplications = async (req, res) => {
  try {
    const companyName = sanitize(req.params.companyName);
    const jobTitle = sanitize(req.params.jobTitle);

    const jobId = await getJobId(companyName, jobTitle);
    if (!jobId) return res.status(404).json({ message: "Job not found" });

    const applications = await JobApplication.findAll({
      where: { jobId },
      include: [{ model: JobSeeker, as: "jobseeker" }],
    });

    const formatted = applications.map((app) => ({
      ...app.get(),
      otherDocuments: app.otherDocuments
        ? app.otherDocuments.split(",").map((doc) => doc.trim())
        : [],
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error in getAllApplications:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await JobApplication.findByPk(applicationId);

    if (!application) return res.status(404).json({ message: "Application not found" });

    await application.destroy();
    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error in deleteApplication:", error);
    res.status(500).json({ error: error.message });
  }
};

async function getJobId(companyName, jobTitle) {
  try {
    const company = await Company.findOne({ where: { companyName } });
    if (!company) return null;

    const job = await Job.findOne({
      where: {
        jobTitle,
        companyId: company.companyId,
      },
    });

    return job ? job.jobId : null;
  } catch (error) {
    console.error("Error fetching jobId:", error);
    return null;
  }
}

exports.applyForJob = async (req, res) => {
  try {
    const jobseekerId = req.user.jobSeekerId;
    const { jobId } = req.query;
    const { email, phoneNumber, notes } = req.body;

    if (!jobseekerId) {
      return res.status(401).json({ message: "Unauthorized: Jobseeker ID missing" });
    }

    // ✅ Updated condition using constants
    const job = await Job.findOne({ where: { jobId } });
    if (!job || job.statusId !== JOB_STATUSES.OPEN) {
      return res.status(400).json({ message: "This job is not currently open for applications" });
    }

    const existingApplication = await JobApplication.findOne({
      where: { jobseekerId, jobId },
    });
    if (existingApplication) {
      return res.status(409).json({ message: "You have already applied for this job." });
    }

    if (!req.files || !req.files.cvDocument || req.files.cvDocument.length === 0) {
      return res.status(400).json({ message: "CV document is required." });
    }

    const cvFile = req.files.cvDocument[0];

    const cvUrl = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: `job_applications/job_${jobId}/jobseeker_${jobseekerId}`,
          public_id: `cv_${Date.now()}_${uuidv4()}`,
          format: "pdf",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
      uploadStream.end(cvFile.buffer);
    });

    // Upload other documents (optional)
    let otherDocumentUrls = [];

    if (req.files.otherDocuments && req.files.otherDocuments.length > 0) {
      for (let i = 0; i < req.files.otherDocuments.length; i++) {
        const doc = req.files.otherDocuments[i];
        const uploadUrl = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "raw",
              folder: `job_applications/job_${jobId}/jobseeker_${jobseekerId}`,
              public_id: `doc_${i + 1}_${Date.now()}_${uuidv4()}`,
              format: "pdf",
            },
            (err, result) => {
              if (err) reject(err);
              else resolve(result.secure_url);
            }
          );
          stream.end(doc.buffer);
        });
        otherDocumentUrls.push(uploadUrl);
      }
    }

    // Save application to database
    const application = await JobApplication.create({
      jobseekerId,
      jobId,
      email,
      phoneNumber,
      notes,
      cvDocument: cvUrl,
      otherDocuments: otherDocumentUrls.join(","),
    });

    res.status(201).json({
      message: "Job application submitted successfully",
      application,
    });
  } catch (err) {
    console.error("Error in applyForJob:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getJobApplicationsByJobId = async (req, res) => {
  try {
    const { jobId } = req.query;
    const companyIdFromToken = req.user.companyId;

    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    // 1. Find the job
    const job = await Job.findByPk(jobId, {
      attributes: ["jobId", "companyId"]
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // 2. Check company ownership
    if (job.companyId !== companyIdFromToken) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to view applications for this job" });
    }

    // 3. Fetch applications and FULL job seeker profiles
    const applications = await JobApplication.findAll({
      where: { jobId },
      include: [
        {
          model: JobSeeker,
          as: "jobseeker",
          attributes: { exclude: ["userId"] },
          include: [
            {
              model: User,
              as: "user",
              attributes: ["username", "imageUrl"],
              include: [
                { model: Country, as: "country", attributes: ["countryName"] },
                { model: City, as: "city", attributes: ["cityName"] }
              ]
            },
            {
              model: JobSeekerSkills,
              as: "skills",
              attributes: ["skillName"]
            },
            {
              model: JobseekerExperience,
              as: "experiences",
              include: [
                { model: City, as: "city", attributes: ["cityName"] },
                { model: Country, as: "country", attributes: ["countryName"] },
                { model: Department, as: "department", attributes: ["departmentName"] }
              ]
            },
            {
              model: JobseekerEducation,
              as: "educations",
              include: [
                { model: City, as: "city", attributes: ["cityName"] },
                { model: Country, as: "country", attributes: ["countryName"] }
              ]
            },
            {
              model: JobPreference,
              as: "preferences",
              include: [
                { model: ContractType, as: "contractTypes", attributes: ["contractTypeId", "type"] },
                { model: ContractDurationPreference, as: "durations", attributes: ["durationId", "name"] },
                { model: Department, as: "departments", attributes: ["departmentId", "departmentName"] },
                {
                  model: JobPreferenceLocation,
                  as: "locations",
                  include: [
                    { model: City, as: "city", attributes: ["cityId", "cityName"] },
                    { model: Country, as: "country", attributes: ["countryId", "countryName"] }
                  ]
                }
              ]
            },
            {
              model: Language,
              as: "languages",
              through: { attributes: ["level"] },
              attributes: ["languageId", "languageName"]
            },
            {
              model: Nationality,
              as: "nationalities",
              attributes: ["nationalityId", "nationalityName"]
            },
            {
              model: JobSeekerWorkPermit,
              as: "workPermits",
              include: [
                { model: Country, as: "country", attributes: ["countryId", "countryName"] }
              ]
            }
          ]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    if (!applications.length) {
      return res.status(200).json({ message: "No applications found for this job", applications: [] });
    }

    return res.status(200).json({ applications });

  } catch (error) {
    console.error("Error fetching job applications:", error);
    return res.status(500).json({ message: "Internal server error", details: error.message });
  }
};


const allowedTransitions = {
  Pending: ["Viewed"],
  Viewed: ["Hired", "Rejected"],
  Hired: ["Viewed", "Rejected"],
  Rejected: ["Viewed"]
};

// exports.updateJobApplicationStatus = async (req, res) => {
//   try {
//     const { applicationId } = req.query;
//     const { newStatus } = req.query;
//     const companyIdFromToken = req.user.companyId; // company must be logged in

//     if (!applicationId || !newStatus) {
//       return res.status(400).json({ message: "Application ID and new status are required" });
//     }

//     // 1. Find the job application
//     const application = await JobApplication.findByPk(applicationId, {
//       include: [
//         {
//           model: Job,
//           as: "job",
//           attributes: ["jobId", "companyId"]
//         }
//       ]
//     });

//     if (!application) {
//       return res.status(404).json({ message: "Job application not found" });
//     }

//     // 2. Check if the logged-in company owns the job
//     if (application.job.companyId !== companyIdFromToken) {
//       return res.status(403).json({ message: "Forbidden: You are not authorized to modify this application" });
//     }

//     // 3. Check if the status transition is allowed
//     const currentStatus = application.status;

//     if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus].includes(newStatus)) {
//       return res.status(400).json({
//         message: `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions are: ${allowedTransitions[currentStatus]?.join(", ") || "None"}.`
//       });
//     }

//     // 4. Update the status
//     application.status = newStatus;
//     await application.save();

//     return res.status(200).json({ message: `Application status updated to '${newStatus}' successfully`, application });

//   } catch (error) {
//     console.error("Error updating application status:", error);
//     return res.status(500).json({ message: "Internal server error", details: error.message });
//   }
// };

exports.updateJobApplicationStatus = async (req, res) => {
  try {
    const { applicationId, newStatus } = req.query;
    const companyIdFromToken = req.user.companyId;

    if (!applicationId || !newStatus) {
      return res.status(400).json({ message: "Application ID and new status are required" });
    }

    const application = await JobApplication.findByPk(applicationId, {
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["jobId", "companyId", "jobTitle"],
          include: {
            model: Company,
            as: "company",
            attributes: ["companyName"]
          }
        },
        {
          model: JobSeeker,
          as: "jobseeker", // ✅ Correct alias here
          include: {
            model: User,
            as: "user",
            attributes: ["email", "firstName","username"]
          }
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ message: "Job application not found" });
    }

    if (application.job.companyId !== companyIdFromToken) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to modify this application" });
    }

    const currentStatus = application.status;

    if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus].includes(newStatus)) {
      return res.status(400).json({
        message: `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions are: ${allowedTransitions[currentStatus]?.join(", ") || "None"}.`
      });
    }

    // Update and save
    application.status = newStatus;
    await application.save();

    // Send email
    const jobTitle = application.job.jobTitle;
    const companyName = application.job.company.companyName;
    const email = application.jobseeker.user.email;
    const firstName =application.jobseeker.user.username;

    await sendApplicationStatusUpdateEmail({
      to: email,
      firstName,
      jobTitle,
      newStatus,
      companyName
    });

    return res.status(200).json({
      message: `Application status updated to '${newStatus}' successfully`,
      application
    });

  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({ message: "Internal server error", details: error.message });
  }
};
exports.getApplicantsForCompanyJobs = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(403).json({ message: "Unauthorized: Company ID not found" });
    }

    // Step 1: Get jobIds for this company
    const jobs = await Job.findAll({
      where: { companyId },
      attributes: ["jobId"]
    });

    const jobIds = jobs.map(job => job.jobId);
    if (!jobIds.length) {
      return res.status(200).json({ jobSeekers: [] }); // No jobs = no applicants
    }

    // Step 2: Get JobApplications (not rejected) for those jobs
    const applications = await JobApplication.findAll({
      where: {
        jobId: { [Op.in]: jobIds },
        status: { [Op.not]: "Rejected" }
      },
      attributes: ["applicationId", "jobseekerId"]
    });

    const jobSeekerIds = [...new Set(applications.map(app => app.jobseekerId))];
    if (!jobSeekerIds.length) {
      return res.status(200).json({ jobSeekers: [] }); // No valid applications
    }

    // Step 3: Get enriched JobSeeker profiles (only verified)
    const jobSeekers = await JobSeeker.findAll({
      where: { jobSeekerId: { [Op.in]: jobSeekerIds } },
      attributes: { exclude: ["userId"] },
      include: [
        {
          model: User,
          as: "user",
          where: { is_verified: true },
          attributes: ["username", "email", "phoneCode", "phoneNumber", "imageUrl"],
          include: [
            { model: Country, as: "country", attributes: ["countryName"] },
            { model: City, as: "city", attributes: ["cityName"] }
          ]
        },
        {
          model: JobSeekerSkills,
          as: "skills",
          attributes: ["jobSeekerSkillId", "skillName"]
        },
        {
          model: JobseekerExperience,
          as: "experiences",
          include: [
            { model: City, as: "city", attributes: ["cityName"] },
            { model: Country, as: "country", attributes: ["countryName"] },
            { model: Department, as: "department", attributes: ["departmentName"] }
          ]
        },
        {
          model: JobseekerEducation,
          as: "educations",
          include: [
            { model: City, as: "city", attributes: ["cityName"] },
            { model: Country, as: "country", attributes: ["countryName"] }
          ]
        },
        {
          model: JobPreference,
          as: "preferences",
          include: [
            { model: ContractType, as: "contractTypes", attributes: ["contractTypeId", "type"] },
            { model: ContractDurationPreference, as: "durations", attributes: ["durationId", "name"] },
            { model: Department, as: "departments", attributes: ["departmentId", "departmentName"] },
            {
              model: JobPreferenceLocation,
              as: "locations",
              include: [
                { model: City, as: "city", attributes: ["cityId", "cityName"] },
                { model: Country, as: "country", attributes: ["countryId", "countryName"] }
              ]
            }
          ]
        },
        {
          model: Language,
          as: "languages",
          through: { model: JobSeekerLanguage, attributes: ["level"] },
          attributes: ["languageId", "languageName"]
        },
        {
          model: Nationality,
          as: "nationalities",
          attributes: ["nationalityId", "nationalityName"]
        },
        {
          model: JobSeekerWorkPermit,
          as: "workPermits",
          include: [
            { model: Country, as: "country", attributes: ["countryId", "countryName"] }
          ]
        }
      ]
    });

    return res.status(200).json({ jobSeekers });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return res.status(500).json({ message: "Internal server error", details: error.message });
  }
};