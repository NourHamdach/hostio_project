"use strict";

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
const User = require("../models/User");
const Country = require("../models/CompanyRelations/CompanyLocations/Country");
const City = require("../models/CompanyRelations/CompanyLocations/City");
const JobApplication=require("../models/jobRelations/JobApplication")
const RejectedJob=require("../models/jobRelations/RejectedJob")
const { Op } = require("sequelize");
const cloudinary = require("../config/cloudinary");
const { sendJobRejectionEmailToCompany } = require("../services/emailService");



exports.createJob = async (req, res) => {
  try {
    const statusId = parseInt(req.query.statusId);
    const companyId = req.user.companyId;
  
    if (!companyId) return res.status(403).json({ message: "Unauthorized" });

    const {
      jobTitle,
      description,
      numberOfPositions,
      contractId,
      durationId,
      startDate,
      latestStartDate,
      payRange,
      generalRequirements,
      hospitalityExperienceRequired,
      restrictToSameDepartmentExperience,
      minimumSeniorityId,
      accommodation,
      otherBenefits,
      applicationMethod,
      externalUrl,
      languages = [],
      departments = [],
      recruiter,
    } = req.body;
    const today = new Date().toISOString().split("T")[0];
    const trimmedAccommodation = accommodation?.trim();
    
    const validationErrors = [];
   
    if (!jobTitle?.trim()) validationErrors.push("jobTitle is required.");
    if (!description?.trim()) validationErrors.push("description is required.");
    else if (/^\d+$/.test(description?.trim())) validationErrors.push("Description cannot contain only numbers.");
    if (!numberOfPositions || Number(numberOfPositions)< 1) validationErrors.push("numberOfPositions must be at least 1.");
    if (!contractId) validationErrors.push("contractId is required.");
    if (!durationId) validationErrors.push("durationId is required.");
    if (!startDate) validationErrors.push("startDate is required.");
    else if (new Date(startDate) <= new Date(today))
      validationErrors.push("startDate must be a future date."); 
    if (latestStartDate && new Date(latestStartDate) <= new Date(startDate))
       validationErrors.push("latestStartDate cannot be before startDate.");
    if (!applicationMethod?.trim()) validationErrors.push("applicationMethod is required.");
    if (!["on hostio", "external url"].includes(applicationMethod)) validationErrors.push("applicationMethod must be 'on hostio' or 'external url'.");
    if (applicationMethod === "external url" && !externalUrl?.trim()) validationErrors.push("externalUrl is required for external jobs.");
    if (languages && !Array.isArray(languages)) validationErrors.push("languages must be an array.");
    if (departments && !Array.isArray(departments)) validationErrors.push("departments must be an array.");
    if (!statusId) validationErrors.push("statusId (from query) is required.");
    // ✅ Updated validation using constants
    if (statusId !== JOB_STATUSES.OPEN && statusId !== JOB_STATUSES.DRAFT) {
      validationErrors.push("statusId must be either 1 (open) or 4 (draft)");
    }
    if (trimmedAccommodation && /^\d+$/.test(trimmedAccommodation))
      validationErrors.push("Accommodation cannot contain only numbers.");
    
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: "Validation errors", errors: validationErrors });
    }

    const company = await Company.findByPk(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });
    
    const hasValidPremium = company.hasPremiumPlan && (!company.premiumExpiresAt || new Date(company.premiumExpiresAt) > new Date());
    console.log(hasValidPremium);
    console.log(!hasValidPremium && statusId !== JOB_STATUSES.DRAFT);

    // ✅ Updated condition using constants
    if (!hasValidPremium && statusId !== JOB_STATUSES.DRAFT) {
      if (!company.verified) {
        return res.status(403).json({ message: "Company must be verified to post jobs." });
      }

      const currentJobCount = await Job.count({ where: { companyId } });
      if (currentJobCount >= company.jobLimit) {
        return res.status(403).json({ message: `You reached your job posting limit of ${company.jobLimit}.` });
      }
    }

    const job = await Job.create({
      companyId,
      jobTitle,
      description,
      numberOfPositions,
      contractId,
      durationId,
      startDate,
      latestStartDate,
      payRange,
      generalRequirements,
      hospitalityExperienceRequired,
      restrictToSameDepartmentExperience,
      minimumSeniorityId,
      accommodation,
      otherBenefits,
      applicationMethod,
      statusId,
    });

    if (applicationMethod === "external url" && externalUrl) {
      await JobExternalLink.create({
        jobId: job.jobId,
        url: externalUrl,
      });
    }

    if (recruiter) {
      await JobRecruiterContact.create({
        jobId: job.jobId,
        firstName: recruiter.firstName,
        lastName: recruiter.lastName,
        jobTitle: recruiter.jobTitle,
        phoneNumber: recruiter.phoneNumber,
        email: recruiter.email,
      });
    }

    if (languages.length > 0) {
      await JobLanguage.bulkCreate(
        languages.map(({ languageId, mandatory }) => ({
          jobId: job.jobId,
          languageId,
          mandatory: !!mandatory,
        }))
      );
    }

    if (departments.length > 0) {
      await JobDepartment.bulkCreate(
        departments.map((departmentId) => ({
          jobId: job.jobId,
          departmentId,
        }))
      );
    }

    res.status(201).json({ message: "Job created successfully", job });
  } catch (error) {
    console.error("Create Job Error:", error);
    res.status(500).json({ message: "Failed to create job", error: error.message });
  }
};

exports.editJob = async (req, res) => {
  const { jobId } = req.params;
  const { companyId } = req.user;

  const {
    jobTitle,
    description,
    numberOfPositions,
    contractId,
    durationId, // updated key
    startDate,
    latestStartDate,
    payRange,
    generalRequirements,
    hospitalityExperienceRequired,
    restrictToSameDepartmentExperience,
    minimumSeniorityId, // updated key
    accommodation,
    otherBenefits,
    applicationMethod,
    externalUrl,
    languages = [],
    departments = [],
    recruiter,
  } = req.body;

  // ✅ Validation
  const validationErrors = [];
  if (!jobTitle?.trim()) validationErrors.push("jobTitle is required.");
  if (!description?.trim()) validationErrors.push("description is required.");
  if (!numberOfPositions || numberOfPositions < 1) validationErrors.push("numberOfPositions must be at least 1.");
  if (!contractId) validationErrors.push("contractId is required.");
  if (!durationId) validationErrors.push("durationId is required.");
  if (!startDate) validationErrors.push("startDate is required.");
  if (!["on hostio", "external url"].includes(applicationMethod)) {
    validationErrors.push("applicationMethod must be 'on hostio' or 'external url'.");
  }
  if (applicationMethod === "external url" && (!externalUrl || !externalUrl.trim())) {
    validationErrors.push("externalUrl is required for 'external url' method.");
  }
  if (languages && !Array.isArray(languages)) validationErrors.push("languages must be an array.");
  if (departments && !Array.isArray(departments)) validationErrors.push("departments must be an array.");

  if (validationErrors.length > 0) {
    return res.status(400).json({ message: "Validation errors", errors: validationErrors });
  }

  try {
    const existingJob = await Job.findByPk(jobId, {
      include: [{ model: JobRecruiterContact, as: "jobRecruiterContact" }],
    });

    if (!existingJob) return res.status(404).json({ message: "Job not found" });
    if (existingJob.companyId !== companyId) return res.status(403).json({ message: "Unauthorized" });

    await Job.sequelize.transaction(async (transaction) => {
      // ✅ Update main Job data
      await existingJob.update(
        {
          jobTitle,
          description,
          numberOfPositions,
          contractId,
          durationId,
          startDate,
          latestStartDate,
          payRange,
          generalRequirements,
          hospitalityExperienceRequired,
          restrictToSameDepartmentExperience,
          minimumSeniorityId,
          accommodation,
          otherBenefits,
          applicationMethod,
        },
        { transaction }
      );

      // ✅ External link logic
      const previousMethod = existingJob.applicationMethod;
      if (applicationMethod === "external url") {
        await JobExternalLink.upsert(
          { jobId, url: externalUrl },
          { transaction }
        );
      } else if (previousMethod === "external url") {
        await JobExternalLink.destroy({ where: { jobId }, transaction });
      }

      // ✅ Recruiter contact
      if (recruiter) {
        await JobRecruiterContact.upsert(
          {
            jobId,
            firstName: recruiter.firstName,
            lastName: recruiter.lastName,
            jobTitle: recruiter.jobTitle,
            phoneNumber: recruiter.phoneNumber,
            email: recruiter.email,
          },
          { transaction }
        );
      }

      // ✅ Update Languages
      await JobLanguage.destroy({ where: { jobId }, transaction });
      await JobLanguage.bulkCreate(
        languages.map(({ languageId, mandatory }) => ({
          jobId,
          languageId,
          mandatory: !!mandatory,
        })),
        { transaction }
      );

      // ✅ Update Departments
      await JobDepartment.destroy({ where: { jobId }, transaction });
      await JobDepartment.bulkCreate(
        departments.map((departmentId) => ({
          jobId,
          departmentId,
        })),
        { transaction }
      );
    });

    return res.status(200).json({ message: "Job updated successfully" });
  } catch (error) {
    console.error("Edit Job Error:", error);
    return res.status(500).json({ message: "Failed to update job", error: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const jobId = parseInt(req.params.jobId);
    if (isNaN(jobId)) return res.status(400).json({ message: "Invalid job ID" });

    const companyId = req.user.companyId;
    if (!companyId) return res.status(403).json({ message: "there is no Token ,Unauthorized" });

    const job = await Job.findByPk(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.companyId !== companyId) return res.status(403).json({ message: "Unauthorized" });

    const deletedStatus = await StatusJob.findOne({ where: { statusName: "Deleted" } });
    if (!deletedStatus) return res.status(500).json({ message: "Deleted status not found in StatusJob table" });

    // ✅ Updated using constants
    job.statusId = JOB_STATUSES.DELETED;
    await job.save();

    res.status(200).json({ message: "Job marked as deleted successfully" });
  } catch (error) {
    console.error("Delete Job Error:", error);
    res.status(500).json({ message: "Failed to delete job", error: error.message });
  }
};

exports.getAllContractTypes = async (req, res) => {
  try {
    const contractTypes = await ContractType.findAll({
      attributes: ["contractTypeId", "type"]
    });

    res.json(contractTypes);
  } catch (error) {
    console.error("Error fetching contract types:", error);
    res.status(500).json({ message: "Failed to fetch contract types", error: error.message });
  }
};

exports.getAllJobStatuses = async (req, res) => {
  try {
    const statuses = await StatusJob.findAll({
      attributes: ["statusId", "statusName"],
      order: [["statusId", "ASC"]],
    });
    res.json(statuses);
  } catch (error) {
    console.error("Error fetching job statuses:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getJobsByStatus = async (req, res) => {
  try {
    const statusQuery = req.query.statusId;

    if (!statusQuery) {
      return res.status(400).json({ message: "statusId is required in query" });
    }

    // Convert to array of integers
    const statusIds = statusQuery
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (statusIds.length === 0) {
      return res.status(400).json({ message: "At least one valid statusId must be provided" });
    }

    const jobs = await Job.findAll({
      where: {
        statusId: statusIds.length === 1 ? statusIds[0] : statusIds,
      },
      include: [
        { model: Company, as: "company", attributes: ["companyId", "companyName"] },
        { model: StatusJob, as: "statusJob", attributes: ["statusName"] },
        { model: ContractType, as: "contractType", attributes: ["type"] },
        { model: ContractDuration, as: "contractDuration", attributes: ["durationType"] },
        { model: MinimumSeniority, as: "minimumSeniority", attributes: ["seniorityLevel"] },
        {
          model: JobRecruiterContact,
          as: "jobRecruiterContact",
          attributes: ["firstName", "lastName", "jobTitle", "phoneNumber", "email"]
        },
        {
          model: Language,
          as: "languages",
          through: { attributes: ["mandatory"] },
          attributes: ["languageId", "languageName"]
        },
        {
          model: Department,
          as: "departments",
          through: { attributes: [] },
          attributes: ["departmentId", "departmentName"]
        },
        {
          model: JobExternalLink,
          as: "externalLink",
          attributes: ["url"]
        }
      ],
    });

    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs by status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getJobsByApplicationMethod = async (req, res) => {
  try {
    let { method } = req.query;

    // ✅ Normalize method from query (e.g. external_url → external url)
    if (!method) {
      return res.status(400).json({ message: "Method query parameter is required" });
    }

    method = method.trim().toLowerCase();

    // ✅ Transform snake_case to original ENUM string
    const methodMap = {
      "external_url": "external url",
      "on_hostio": "on hostio",
    };

    const transformedMethod = methodMap[method];

    if (!transformedMethod) {
      return res.status(400).json({ message: "Invalid application method" });
    }

    const jobs = await Job.findAll({
      where: { applicationMethod: transformedMethod },
      include: [
        { model: Company, as: "company", attributes: ["companyId", "companyName"] },
        { model: StatusJob, as: "statusJob", attributes: ["statusName"] },
        { model: ContractType, as: "contractType", attributes: ["type"] },
        { model: ContractDuration, as: "contractDuration", attributes: ["durationType"] },
        { model: MinimumSeniority, as: "minimumSeniority", attributes: ["seniorityLevel"] },
        {
          model: JobRecruiterContact,
          as: "jobRecruiterContact",
          attributes: ["firstName", "lastName", "jobTitle", "phoneNumber", "email"]
        },
        {
          model: Language,
          as: "languages",
          through: { attributes: ["mandatory"] },
          attributes: ["languageId", "languageName"]
        },
        {
          model: Department,
          as: "departments",
          through: { attributes: [] },
          attributes: ["departmentId", "departmentName"]
        },
        {
          model: JobExternalLink,
          as: "externalLink",
          attributes: ["url"]
        }
      ],
    });

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs by application method:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getJobsByStartDate = async (req, res) => {
  try {
    const { date } = req.query; // format: YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const jobs = await Job.findAll({
      where: {
        startDate: {
          [Op.between]: [
            new Date(`${date}T00:00:00.000Z`),
            new Date(`${date}T23:59:59.999Z`),
          ],
        },
      },
      include: [
        { model: Company, as: "company", attributes: ["companyId", "companyName"] },
        { model: StatusJob, as: "statusJob", attributes: ["statusName"] },
        { model: ContractType, as: "contractType", attributes: ["type"] },
        { model: ContractDuration, as: "contractDuration", attributes: ["durationType"] },
        { model: MinimumSeniority, as: "minimumSeniority", attributes: ["seniorityLevel"] },
        {
          model: JobRecruiterContact,
          as: "jobRecruiterContact",
          attributes: ["firstName", "lastName", "jobTitle", "phoneNumber", "email"]
        },
        {
          model: Language,
          as: "languages",
          through: { attributes: ["mandatory"] },
          attributes: ["languageId", "languageName"]
        },
        {
          model: Department,
          as: "departments",
          through: { attributes: [] },
          attributes: ["departmentId", "departmentName"]
        },
        {
          model: JobExternalLink,
          as: "externalLink",
          attributes: ["url"]
        }
      ],
    });

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs by date:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: {
        // ✅ Updated using constants
        statusId: [JOB_STATUSES.OPEN, JOB_STATUSES.CLOSED],
      },
      include: [
        { model: Company, as: "company", attributes: ["companyId",
            "companyName",
            "companyDescription",
            "backgroundImageUrl",
            "mediaUrl",
            "mediaType",
            "hasPremiumPlan",
            "premiumSince",
            "premiumExpires",
            "createdAt",], 
          include: [
            {
              model: User,
              as: "user",
              attributes: ["imageUrl","cityId", "countryId"],
              include: [
                { model: City, as: "city", attributes: ["cityId", "cityName"] },
                { model: Country, as: "country", attributes: ["countryId", "countryName"] }
              ]
            }
          ]
        },
        { model: StatusJob, as: "statusJob", attributes: ["statusName"] },
        { model: ContractType, as: "contractType", attributes: ["type"] },
        { model: ContractDuration, as: "contractDuration", attributes: ["durationType"] },
        { model: MinimumSeniority, as: "minimumSeniority", attributes: ["seniorityLevel"] },
        {
          model: JobRecruiterContact,
          as: "jobRecruiterContact",
          attributes: ["firstName", "lastName", "jobTitle", "phoneNumber", "email"]
        },
        {
          model: Language,
          as: "languages",
          through: { attributes: ["mandatory"] },
          attributes: ["languageId", "languageName"]
        },
        {
          model: Department,
          as: "departments",
          through: { attributes: [] },
          attributes: ["departmentId", "departmentName"]
        },
        {
          model: JobExternalLink,
          as: "externalLink",
          attributes: ["url"]
        }
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching all jobs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getJobsByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.query;

    const jobs = await Job.findAll({
      where: {
        companyId,
        // ✅ Updated using constants
        statusId: [JOB_STATUSES.OPEN, JOB_STATUSES.CLOSED],
      },
      include: [
        {
          model: Company,
          as: "company",
          attributes: [
            "companyId",
            "companyName",
            "companyDescription",
            "backgroundImageUrl",
            "mediaUrl",
            "mediaType",
            "hasPremiumPlan",
            "premiumSince",
            "premiumExpires",
            "createdAt",
          ],
          include: [
            { association: "type", attributes: ["typeName"] },
            { association: "companySize", attributes: ["sizeName"] },
          ],
        },
        { model: StatusJob, as: "statusJob", attributes: ["statusName"] },
        { model: ContractType, as: "contractType", attributes: ["type"] },
        { model: MinimumSeniority, as: "minimumSeniority", attributes: ["seniorityLevel"] },
        { model: ContractDuration, as: "contractDuration", attributes: ["durationType"] },
        { model: JobRecruiterContact, as: "jobRecruiterContact" },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ jobs });
  } catch (error) {
    console.error("Error in getJobsByCompanyId:", error);
    res.status(500).json({ message: "Failed to fetch company job listings" });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobSeekerId = req.user?.jobSeekerId || null;
    const companyIdFromToken = req.user?.companyId || null;

    const job = await Job.findByPk(jobId, {
      include: [
        {
          model: Company,
          as: "company",
          attributes: ["companyId", "companyName", "companyDescription", "backgroundImageUrl"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["imageUrl", "cityId", "countryId"],
              include: [
                { model: City, as: "city", attributes: ["cityId", "cityName"] },
                { model: Country, as: "country", attributes: ["countryId", "countryName"] }
              ]
            }
          ]
        },
        { model: StatusJob, as: "statusJob", attributes: ["statusName"] },
        { model: ContractType, as: "contractType", attributes: ["type"] },
        { model: ContractDuration, as: "contractDuration", attributes: ["durationType"] },
        { model: MinimumSeniority, as: "minimumSeniority", attributes: ["seniorityLevel"] },
        {
          model: JobRecruiterContact,
          as: "jobRecruiterContact",
          attributes: ["firstName", "lastName", "jobTitle", "phoneNumber", "email"]
        },
        {
          model: Language,
          as: "languages",
          through: { attributes: ["mandatory"] },
          attributes: ["languageId", "languageName"]
        },
        {
          model: Department,
          as: "departments",
          through: { attributes: [] },
          attributes: ["departmentId", "departmentName"]
        },
        {
          model: JobExternalLink,
          as: "externalLink",
          attributes: ["url"]
        }
      ],
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // ✅ Updated condition using constants
    if (job.statusId === JOB_STATUSES.DRAFT) {
      if (!companyIdFromToken || companyIdFromToken !== job.companyId) {
        return res.status(403).json({ message: "Forbidden: You are not authorized to view this draft job" });
      }
    }

    const nbOfApplicants = await JobApplication.count({
      where: { jobId: jobId }
    });

    const nbOfHiredApplicants = await JobApplication.count({
      where: {
        jobId: jobId,
        status: "Hired"
      }
    });

    if (jobSeekerId) {
      let applied = false;
      const existingApplication = await JobApplication.findOne({
        where: {
          jobseekerId: jobSeekerId,
          jobId: jobId
        }
      });

      if (existingApplication) {
        applied = true;
      }

      return res.status(200).json({
        ...job.toJSON(),
        applied,
        nbOfApplicants,
        nbOfHiredApplicants
      });
    }

    res.status(200).json({
      ...job.toJSON(),
      nbOfApplicants,
      nbOfHiredApplicants
    });

  } catch (error) {
    console.error("Error fetching job by ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.closeJob = async (req, res) => {
  try {
    const jobId = parseInt(req.query.jobId);
    if (isNaN(jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const job = await Job.findByPk(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.companyId !== companyId) {
      return res.status(403).json({ message: "You are not allowed to close this job" });
    }

    // ✅ Updated condition using constants
    if (job.statusId === JOB_STATUSES.DELETED) {
      return res.status(400).json({ message: "Cannot close a deleted job" });
    }

    // ✅ Updated assignment using constants
    await job.update({
      statusId: JOB_STATUSES.CLOSED,
      availability: false
    });

    return res.status(200).json({ message: "Job successfully closed", job });
  } catch (error) {
    console.error("Error closing job:", error);
    return res.status(500).json({ message: "Failed to close job", error: error.message });
  }
};

exports.makeJobOpen = async (req, res) => {
  try {
    const { jobId } = req.query;
    const companyId = req.user.companyId;

    const job = await Job.findByPk(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    const company = await Company.findByPk(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });
    
    const hasValidPremium = company.hasPremiumPlan && (!company.premiumExpiresAt || new Date(company.premiumExpiresAt) > new Date());
    console.log(hasValidPremium);

    if (!hasValidPremium) {
      if (!company.verified) {
        return res.status(403).json({ message: "Company must be verified to post jobs." });
      }

      // ✅ Updated condition using constants
      const currentJobCount = await Job.count({ where: { companyId, statusId: [JOB_STATUSES.OPEN, JOB_STATUSES.CLOSED] } });
      if (currentJobCount >= company.jobLimit) {
        return res.status(403).json({ message: `You reached your job posting limit of ${company.jobLimit}.` });
      }
    }

    // ✅ Updated condition using constants
    if (![JOB_STATUSES.CLOSED, JOB_STATUSES.DRAFT].includes(job.statusId)) {
      return res.status(400).json({
        message: "Only draft or closed jobs can be converted to open",
      });
    }

    // ✅ Updated assignment using constants
    job.statusId = JOB_STATUSES.OPEN;
    await job.save();

    res.status(200).json({
      message: "Job status updated to Open",
      job,
    });
  } catch (error) {
    console.error("Error in makeJobOpen:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.rejectJobByAdmin = async (req, res) => {
  try {
    const { jobId } = req.query;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ message: "Rejection reason must be at least 5 characters." });
    }

    const job = await Job.findByPk(jobId);
    if (!job) return res.status(404).json({ message: "Job not found." });
    
    // ✅ Updated condition using constants
    if (job.statusId === JOB_STATUSES.DELETED || job.statusId === JOB_STATUSES.REJECTED) {
      return res.status(400).json({ message: "deleted or rejected jobs can't be rejected." });
    }
    
    const alreadyRejected = await RejectedJob.findOne({ where: { jobId } });
    if (alreadyRejected) {
      return res.status(400).json({ message: "This job has already been rejected." });
    }
    
    const company = await Company.findByPk(job.companyId, {
      include: [{ model: User, as: "user", attributes: ["email"] }]
    });
    
    const email = company?.user?.email;
    if (!email) {
      console.warn("⚠️ No email found for the company. Skipping rejection email.");
    } else {
      // ✅ Updated assignment using constants
      await job.update({ statusId: JOB_STATUSES.REJECTED });

      await RejectedJob.create({ jobId: job.jobId, reason });

      await sendJobRejectionEmailToCompany({
        to: email,
        companyName: company.companyName,
        jobTitle: job.jobTitle,
        reason
      });
    }
    
    return res.status(200).json({
      message: "Job rejected and company notified via email.",
      jobId: job.jobId,
    });
  } catch (error) {
    console.error("Reject Job Error:", error);
    res.status(500).json({ message: "Failed to reject job", error: error.message });
  }
};

exports.getAllRejectedJobs = async (req, res) => {
  try {
    const rejectedJobs = await RejectedJob.findAll({
      include: [
        {
          model: Job,
          as: "job",
          include: [
            {
              model: Company,
              as: "company",
              attributes: ["companyId", "companyName", "companyDescription", "backgroundImageUrl"],
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["imageUrl", "cityId", "countryId"],
                  include: [
                    { model: City, as: "city", attributes: ["cityId", "cityName"] },
                    { model: Country, as: "country", attributes: ["countryId", "countryName"] }
                  ]
                }
              ]
            },
            { model: StatusJob, as: "statusJob", attributes: ["statusName"] },
            { model: ContractType, as: "contractType", attributes: ["type"] },
            { model: ContractDuration, as: "contractDuration", attributes: ["durationType"] },
            { model: MinimumSeniority, as: "minimumSeniority", attributes: ["seniorityLevel"] },
            {
              model: JobRecruiterContact,
              as: "jobRecruiterContact",
              attributes: ["firstName", "lastName", "jobTitle", "phoneNumber", "email"]
            },
            {
              model: Language,
              as: "languages",
              through: { attributes: ["mandatory"] },
              attributes: ["languageId", "languageName"]
            },
            {
              model: Department,
              as: "departments",
              through: { attributes: [] },
              attributes: ["departmentId", "departmentName"]
            },
            {
              model: JobExternalLink,
              as: "externalLink",
              attributes: ["url"]
            }
          ]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    const formatted = rejectedJobs.map(r => ({
      rejectedJobId: r.rejectedJobId,
      reason: r.reason,
      rejectedAt: r.createdAt,
      job: r.job
    }));

    res.status(200).json({
      message: "Rejected jobs fetched successfully",
      rejectedJobs: formatted
    });
  } catch (error) {
    console.error("getAllRejectedJobs error:", error);
    res.status(500).json({ message: "Failed to fetch rejected jobs", error: error.message });
  }
};
exports.getJobsByCreatedAt = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date query param is required (YYYY-MM-DD)" });
    }

    // Format date boundaries
    const startOfDay = new Date(`${date}T00:00:00Z`);
    const endOfDay = new Date(`${date}T23:59:59Z`);

    const jobs = await Job.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      include: [
        { model: Company, as: "company", attributes: ["companyId", "companyName"] },
        { model: StatusJob, as: "statusJob", attributes: ["statusName"] },
        { model: ContractType, as: "contractType", attributes: ["type"] },
        { model: ContractDuration, as: "contractDuration", attributes: ["durationType"] },
        { model: MinimumSeniority, as: "minimumSeniority", attributes: ["seniorityLevel"] },
        {
          model: JobRecruiterContact,
          as: "jobRecruiterContact",
          attributes: ["firstName", "lastName", "jobTitle", "phoneNumber", "email"]
        },
        {
          model: Language,
          as: "languages",
          through: { attributes: ["mandatory"] },
          attributes: ["languageId", "languageName"]
        },
        {
          model: Department,
          as: "departments",
          through: { attributes: [] },
          attributes: ["departmentId", "departmentName"]
        },
        {
          model: JobExternalLink,
          as: "externalLink",
          attributes: ["url"]
        }
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs by createdAt:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getMyCompanyJobs = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(403).json({ message: "Unauthorized: No company ID in token" });
    }

    const jobs = await Job.findAll({
      where: { companyId },
      include: [
        {
          model: Company,
          as: "company",
          attributes: [
            "companyId",
            "companyName",
            "companyDescription",
            "backgroundImageUrl",
            "mediaUrl",
            "mediaType",
            "hasPremiumPlan",
            "premiumSince",
            "premiumExpires",
            "createdAt",
          ],
          include: [
            { association: "type", attributes: ["typeName"] },
            { association: "companySize", attributes: ["sizeName"] },
            {
              model: User,
              as: "user", // ✅ Correct association to User
              attributes: ["imageUrl","cityId", "countryId"],
              include: [
                { model: City, as: "city", attributes: ["cityId", "cityName"] },
                { model: Country, as: "country", attributes: ["countryId", "countryName"] }
              ]
            }
          ],
        },
        { model: StatusJob, as: "statusJob", attributes: ["statusName"] },
        { model: ContractType, as: "contractType", attributes: ["type"] },
        { model: MinimumSeniority, as: "minimumSeniority", attributes: ["seniorityLevel"] },
        { model: ContractDuration, as: "contractDuration", attributes: ["durationType"] },
        { model: JobRecruiterContact, as: "jobRecruiterContact" }
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ jobs });
  } catch (error) {
    console.error("Error in getMyCompanyJobs:", error);
    res.status(500).json({ message: "Failed to fetch jobs for your company" });
  }
};

// ✅ Get All Languages
exports.getAllLanguages = async (req, res) => {
  try {
    const languages = await Language.findAll({
      attributes: ["languageId", "languageName"],
      order: [["languageName", "ASC"]],
    });
    res.json(languages);
  } catch (error) {
    console.error("Get Languages Error:", error);
    res.status(500).json({ message: "Failed to fetch languages" });
  }
};

// ✅ Get All Departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      attributes: ["departmentId", "departmentName"],
      order: [["departmentName", "ASC"]],
    });
    res.json(departments);
  } catch (error) {
    console.error("Get Departments Error:", error);
    res.status(500).json({ message: "Failed to fetch departments" });
  }
};
exports.getAllJobDetails = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      include: [
        {
          model: Company,
          as: "company",
          attributes: [
            "companyId",
            "companyName",
            "companyDescription",
            "backgroundImageUrl",
            "mediaUrl",
            "mediaType",
            "hasPremiumPlan",
            "premiumSince",
            "premiumExpires",
            "createdAt",
          ],
          include: [
            { association: "type", attributes: ["typeName"] },
            { association: "companySize", attributes: ["sizeName"] },

          ],
        },
        { model: StatusJob, as: "statusJob", attributes: ["statusName"] },
        { model: ContractType, as: "contractType", attributes: ["type"] },
        { model: MinimumSeniority, as: "minimumSeniority", attributes: ["seniorityLevel"] }, // ✅ FIXED
        { model: ContractDuration, as: "contractDuration", attributes: ["durationType"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ jobs });
  } catch (error) {
    console.error("Error in getAllJobDetails:", error);
    res.status(500).json({ message: "Failed to fetch job listings" });
  }
};