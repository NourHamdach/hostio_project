const JobSeeker = require("../models/Jobseeker");
const User = require("../models/User");
const moment = require('moment'); // Import moment
// defining axios
const axios = require("axios");
// Skills
const JobSeekerSkills = require("../models/JobseekerRelations/Skills/JobseekerSkills");
const Skills = require("../models/JobseekerRelations/Skills/Skills"); // adjust path if needed

// Experience
const JobseekerExperience = require("../models/JobseekerRelations/JobseekerExperience");

// Education
const JobseekerEducation = require("../models/JobseekerRelations/Educations/JobseekerEducations");

// Preferences
const JobPreference = require("../models/JobseekerRelations/JobPreferences/JobPreferences");

const ContractDurationPreference = require("../models/JobseekerRelations/JobPreferences/ContractDurationPreference");
const Country = require("../models/CompanyRelations/CompanyLocations/Country");
const City = require("../models/CompanyRelations/CompanyLocations/City");

const JobPreferenceContractType = require("../models/JobseekerRelations/JobPreferences/JobPreferenceContractType");
const JobPreferenceContractDuration = require("../models/JobseekerRelations/JobPreferences/JobPreferenceContractDuration");
const JobPreferenceDepartment = require("../models/JobseekerRelations/JobPreferences/JobPreferenceDepartment");
const JobPreferenceLocation = require("../models/JobseekerRelations/JobPreferences/JobPreferenceLocation");

const Languages = require("../models/Languages");
// Languages & Nationalities
const JobSeekerLanguage = require("../models/JobseekerRelations/JobSeekerLanguage");
const Nationality = require("../models/JobseekerRelations/Nationality");
const JobSeekerNationality = require("../models/JobseekerRelations/JobSeekerNationality");
const JobSeekerWorkPermit = require("../models/JobseekerRelations/JobSeekerWorkPermit");
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
const SavedJob=require("../models/JobseekerRelations/SavedJob")

// Utilities & Upload
const fetchUniversityByName = require("../utils/fetchUniversityData");
const cloudinary = require("../config/cloudinary");

// Applications
const JobApplication = require("../models/jobRelations/JobApplication");



exports.getAllUniversities = async (req, res) => {
  try {
    const { name, country } = req.query;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Please provide a university name using ?name=" });
    }

    const universityData = await fetchUniversityByName(name, country);

    if (!universityData) {
      return res.status(404).json({ error: "No universities found for the given name" });
    }

    return res.status(200).json({ university: universityData });
  } catch (error) {
    console.error("🔥 ERROR in getAllUniversities:", error.message);
    return res.status(500).json({ error: "Failed to fetch university information" });
  }
};





exports.getAllJobSeekers = async (req, res) => {
  try {
    const jobSeekers = await JobSeeker.findAll({
      include: [
        { 
          model: User, 
          as: "user",
          where: { is_verified: true }, // ✅ Only include verified users
          attributes: ["userId", "username", "email", "phoneCode", "phoneNumber", "imageUrl"],
          include: [
            { model: City, as: "city", attributes: ["cityName"] },
            { model: Country, as: "country", attributes: ["countryName"] }
          ]
        },
        {
          model: JobSeekerSkills,
          as: "skills",
          attributes: ["jobSeekerSkillId", "skillName"]
        },
        {
          model: JobPreference,
          as: "preferences",
          include: [
            { model: ContractType, as: "contractTypes", attributes: ["contractTypeId", "type"] },
            { model: ContractDurationPreference, as: "durations", attributes: ["durationId", "name"] },
            { model: Department, as: "departments", attributes: ["departmentId", "departmentName"] }
          ]
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
          model: Languages,
          as: "languages",
          attributes: ["languageId", "languageName"],
          through: {
            model: JobSeekerLanguage,
            attributes: ["level"] // ✅ includes the level from join table
          }
        }
      ]
      
    });

    res.status(200).json(jobSeekers);
  } catch (error) {
    console.error("getAllJobSeekers error:", error);
    res.status(500).json({ message: "Error retrieving Job Seeker profiles", details: error.message });
  }
};



exports.getJobSeekerByjobSeekerId = async (req, res) => {
  try {
    const { jobSeekerId } = req.params;

    const jobSeeker = await JobSeeker.findOne({
      where: { jobSeekerId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["username", "email", "phoneCode", "phoneNumber","imageUrl"],
          include: [
            { model: Country, as: "country", attributes: ["countryName"] },
            { model: City, as: "city", attributes: ["cityName"] }
          ]
        },
        {
          model: JobSeekerSkills,
          as: "skills",
          attributes: ["jobSeekerSkillId","skillName"]
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
          through: { attributes: ["level"] }, // from JobSeekerLanguage
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
            {
              model: Country,
              as: "country",
              attributes: ["countryId", "countryName"]
            }
          ]
        }
      ]
    });

    if (!jobSeeker) {
      return res.status(404).json({ message: "Job Seeker profile not found" });
    }

    res.status(200).json(jobSeeker);

  } catch (error) {
    console.error("getJobSeekerByUserId error:", error);
    res.status(500).json({ message: "Error retrieving Job Seeker profile", details: error.message });
  }
};




exports.deleteJobSeeker = async (req, res) => {
  try {
    const { userId } = req.params;
    const jobSeeker = await JobSeeker.findOne({ where: { userId } });
    if (!jobSeeker) return res.status(404).json({ message: "Job Seeker profile not found" });

    await JobseekerWorksAt.destroy({ where: { jobseekerId: jobSeeker.jobSeekerId } });
    await JobSeekerSkills.destroy({ where: { jobSeekerId: jobSeeker.jobSeekerId } });
    await JobSeekerPreferences.destroy({ where: { jobSeekerId: jobSeeker.jobSeekerId } });
    await JobseekerEducation.destroy({ where: { jobseekerId: jobSeeker.jobSeekerId } });
    await jobSeeker.destroy();
    await User.destroy({ where: { userId } });

    res.status(200).json({ message: "Job Seeker profile and User account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Job Seeker profile", details: error.message });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const jobSeekerId = req.user.jobSeekerId;
    if (!jobSeekerId) {
      return res.status(403).json({ message: "Unauthorized: JobSeeker ID not found" });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "raw", folder: "resumes" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const jobSeeker = await JobSeeker.findByPk(jobSeekerId);
    if (!jobSeeker) {
      return res.status(404).json({ message: "JobSeeker not found" });
    }

    jobSeeker.resume = result.secure_url;
    await jobSeeker.save();

    res.status(200).json({
      message: "Resume uploaded successfully",
      resumeUrl: jobSeeker.resume,
    });
  } catch (error) {
    console.error("Resume Upload Error:", error);
    res.status(500).json({ message: "Failed to upload resume", error: error.message });
  }
};
exports.getMyJobApplications = async (req, res) => {
  try {
    const jobseekerId = req.user.jobSeekerId;
    if (!jobseekerId) {
      return res.status(403).json({ message: "Unauthorized: JobSeeker ID not found" });
    }

    const applications = await JobApplication.findAll({
      where: { jobseekerId },
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
          ],
        }
      ],
      order: [["applicationDate", "DESC"]],
    });

    res.status(200).json({ applications });

  } catch (error) {
    console.error("Error in getMyJobApplications:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};




exports.setJobSeekerPreferences = async (req, res) => {
  try {
    const jobSeekerId = req.user.jobSeekerId;
    if (!jobSeekerId) return res.status(403).json({ message: "Unauthorized" });

    const {
      isLookingForJob,
      availableFrom,
      isAvailableNow,
      getSuggestedJobEmails,
      contractTypeIds = [],
      durationIds = [],
      departmentIds = [],
      locations = [], // { cityName, countryName }
    } = req.body;

    const jobSeeker = await JobSeeker.findByPk(jobSeekerId);
    if (!jobSeeker) return res.status(404).json({ message: "Job Seeker not found" });
     const validationErrors = [];

const today = new Date();
today.setHours(0, 0, 0, 0);

// --- ✅ availableFrom validation
if (availableFrom) {
  const parsedDate = new Date(availableFrom);
  parsedDate.setHours(0, 0, 0, 0);

  if (isNaN(parsedDate.getTime())) {
    validationErrors.push("availableFrom must be a valid date.");
  } else {
    if (parsedDate < today) {
      validationErrors.push("availableFrom cannot be in the past.");
    }
    if (isAvailableNow && parsedDate > today) {
      validationErrors.push("If available now, availableFrom must be today or null.");
    }
  }
}

// --- ✅ ID existence checks
const [validCTs, validDurs, validDepts] = await Promise.all([
  ContractType.findAll({ where: { contractTypeId: contractTypeIds } }),
  ContractDurationPreference.findAll({ where: { durationId: durationIds } }),
  Department.findAll({ where: { departmentId: departmentIds } }),
]);

if (validCTs.length !== contractTypeIds.length) {
  validationErrors.push("Some contractTypeIds are invalid.");
}
if (validDurs.length !== durationIds.length) {
  validationErrors.push("Some durationIds are invalid.");
}
if (validDepts.length !== departmentIds.length) {
  validationErrors.push("Some departmentIds are invalid.");
}

// --- ✅ Location field structure
locations.forEach((loc, i) => {
  if (!loc || !loc.cityName?.trim() || !loc.countryName?.trim()) {
    validationErrors.push(`Location at index ${i} must include valid cityName and countryName.`);
  }
});

// --- ❌ Return early if any validation fails
if (validationErrors.length > 0) {
  return res.status(400).json({
    message: "Validation failed",
    errors: validationErrors,
  });
}


    await jobSeeker.update({ isLookingForJob: !!isLookingForJob });

    const [preference] = await JobPreference.upsert({
      jobSeekerId,
      availableFrom: availableFrom || null,
      isAvailableNow: !!isAvailableNow,
      getSuggestedJobEmails: !!getSuggestedJobEmails,
    }, { returning: true });


    const prefId = preference.jobPreferenceId;

    // 🔁 Clear old preferences
    await Promise.all([
      JobPreferenceContractType.destroy({ where: { jobPreferenceId: prefId } }),
      JobPreferenceContractDuration.destroy({ where: { jobPreferenceId: prefId } }),
      JobPreferenceDepartment.destroy({ where: { jobPreferenceId: prefId } }),
      JobPreferenceLocation.destroy({ where: { jobPreferenceId: prefId } }),
    ]);

    // 🆕 Save new preferences
    const [savedCT, savedDur, savedDept, savedLocs] = await Promise.all([
      JobPreferenceContractType.bulkCreate(contractTypeIds.map(id => ({
        jobPreferenceId: prefId,
        contractTypeId: id,
      }))),
      JobPreferenceContractDuration.bulkCreate(durationIds.map(id => ({
        jobPreferenceId: prefId,
        durationId: id,
      }))),
      JobPreferenceDepartment.bulkCreate(departmentIds.map(id => ({
        jobPreferenceId: prefId,
        departmentId: id,
      }))),
      Promise.all(locations.map(async loc => {
        if (!loc.cityName || !loc.countryName) return null;

        const [country] = await Country.findOrCreate({
          where: { countryName: loc.countryName.trim() },
          defaults: { countryName: loc.countryName.trim() },
        });

        const [city] = await City.findOrCreate({
          where: {
            cityName: loc.cityName.trim(),
            countryId: country.countryId,
          },
          defaults: {
            cityName: loc.cityName.trim(),
            countryId: country.countryId,
          },
        });

        return await JobPreferenceLocation.create({
          jobPreferenceId: prefId,
          cityId: city.cityId,
          countryId: country.countryId,
        });
      }))
    ]);

    // 📦 Fetch full resolved data for response
    const [contractTypes, durations, departments, locationData] = await Promise.all([
      ContractType.findAll({ where: { contractTypeId: contractTypeIds } }),
      ContractDurationPreference.findAll({ where: { durationId: durationIds } }),
      Department.findAll({ where: { departmentId: departmentIds } }),
      JobPreferenceLocation.findAll({
        where: { jobPreferenceId: prefId },
        include: [
          { model: City, as: "city", attributes: ["cityId", "cityName"] },
          { model: Country, as: "country", attributes: ["countryId", "countryName"] }
        ]
      })
    ]);

    return res.status(200).json({
      message: "Preferences saved successfully",
      preferences: {
        isLookingForJob: !!isLookingForJob,
        availableFrom,
        isAvailableNow: !!isAvailableNow,
        getSuggestedJobEmails: !!getSuggestedJobEmails,
        contractTypes,
        durations,
        departments,
        locations: locationData.map(loc => ({
          city: loc.city,
          country: loc.country
        }))
      }
    });
  } catch (error) {
    console.error("setJobSeekerPreferences error:", error);
    res.status(500).json({
      message: "An error occurred while updating preferences",
      details: error.message,
    });
  }
};
exports.getMyJobPreferences = async (req, res) => {
  try {
    const jobSeekerId = req.user.jobSeekerId;
    if (!jobSeekerId) return res.status(403).json({ message: "Unauthorized" });

    const preference = await JobPreference.findOne({
      where: { jobSeekerId },
      include: [
        { model: ContractType, as: "contractTypes" },
        { model: ContractDurationPreference, as: "durations" },
        { model: Department, as: "departments" },
        {
          model: JobPreferenceLocation,
          as: "locations", // ✅ MUST match the alias in .hasMany()
          include: [
            { model: City, as: "city", attributes: ["cityId", "cityName"] },
            { model: Country, as: "country", attributes: ["countryId", "countryName"] },
          ]
        }
      ],
    });

    if (!preference) {
      return res.status(404).json({ message: "No preferences found" });
    }

    // 🧠 Extract location info from alias `locations`
    const locations = preference.locations?.map(loc => ({
      city: loc.city,
      country: loc.country,
    })) || [];

    res.status(200).json({
      message: "Job preferences fetched successfully",
      preferences: {
        isLookingForJob: preference.jobSeeker?.isLookingForJob ?? true,
        availableFrom: preference.availableFrom,
        isAvailableNow: preference.isAvailableNow,
        getSuggestedJobEmails: preference.getSuggestedJobEmails,
        contractTypes: preference.contractTypes,
        durations: preference.durations,
        departments: preference.departments,
        locations,
      },
    });
  } catch (error) {
    console.error("getMyJobPreferences error:", error);
    res.status(500).json({
      message: "Internal server error",
      details: error.message,
    });
  }
};
exports.getAllDurations = async (req, res) => {
  try {
    const durations = await ContractDurationPreference.findAll({
      attributes: ["durationId", "name"],
      order: [["durationId"]],
    });

    res.status(200).json({ durations });
  } catch (error) {
    console.error("getAllDurations error:", error);
    res.status(500).json({ message: "Failed to fetch contract durations", details: error.message });
  }
};


exports.addProfessionalExperience = async (req, res) => {
  try {
    const jobSeekerId = req.user.jobSeekerId;
    const {
      jobTitle,
      companyName,
      departmentId,
      cityName,
      countryName,
      startDate,
      endDate,
      isCurrent,
      description,
      updateLocationInUser,
    } = req.body;

    const validationErrors = [];

    const trimmedCompanyName = companyName?.trim();
    const trimmedDescription = description?.trim();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Required fields
    if (!jobTitle || !trimmedCompanyName || !departmentId || !startDate || isCurrent === undefined) {
      validationErrors.push("Missing required fields.");
    }
    
    // 🔹 Company name check
    if (
      /^\d+$/.test(trimmedCompanyName) ||
      trimmedCompanyName.length === 1 ||
      /^[^a-zA-Z0-9]$/.test(trimmedCompanyName)
    ) {
      validationErrors.push("companyName must not be only numbers, a single char, or a symbol.");
    }
    
    // 🔹 Description check (optional)
    if (trimmedDescription && (
      /^\d+$/.test(trimmedDescription) ||
      /^[^a-zA-Z0-9]$/.test(trimmedDescription)
    )) {
      validationErrors.push("description must not be only numbers or a single special character.");
    }
    
    // 🔹 startDate validation
    const parsedStart = new Date(startDate);
    parsedStart.setHours(0, 0, 0, 0);
    
    if (isNaN(parsedStart.getTime())) {
      validationErrors.push("startDate must be a valid date.");
    } else if (parsedStart > today) {
      validationErrors.push("startDate cannot be in the future.");
    }
    
    // 🔹 endDate validation (if not current)
    if (!isCurrent) {
      if (!endDate) {
        validationErrors.push("endDate is required if isCurrent is false.");
      } else {
        const parsedEnd = new Date(endDate);
        parsedEnd.setHours(0, 0, 0, 0);
    
        if (isNaN(parsedEnd.getTime())) {
          validationErrors.push("endDate must be a valid date.");
        } else if (parsedEnd < parsedStart) {
          validationErrors.push("endDate must be after or equal to startDate.");
        }
      }
    }
    
    // ❌ Return if any validation fails
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation failed.",
        errors: validationErrors,
      });
    }
    

    // ✅ Find or create Country
    const [country] = await Country.findOrCreate({
      where: { countryName: countryName.trim() },
      defaults: { countryName: countryName.trim() },
    });

    // ✅ Find or create City
    const [city] = await City.findOrCreate({
      where: {
        cityName: cityName.trim(),
        countryId: country.countryId,
      },
      defaults: {
        cityName: cityName.trim(),
        countryId: country.countryId,
      },
    });

    // ✅ Insert Experience
    const experience = await JobseekerExperience.create({
      jobseekerId: jobSeekerId,
      jobTitle,
      companyName,
      departmentId,
      cityId: city.cityId,
      countryId: country.countryId,
      startDate,
      endDate: isCurrent ? null : endDate,
      isCurrent,
      description,
    });

    // ✅ Optionally update user's current location
    if (updateLocationInUser) {
      await User.update(
        {
          cityId: city.cityId,
          countryId: country.countryId,
        },
        { where: { userId: req.user.userId } }
      );
    }

    res.status(201).json({
      message: "Professional experience added successfully.",
      experience,
    });
  } catch (error) {
    console.error("addProfessionalExperience error:", error);
    res.status(500).json({
      message: "Internal server error while adding professional experience",
      details: error.message,
    });
  }
};
exports.getMyProfessionalExperiences = async (req, res) => {
  try {
    const jobseekerId = req.user.jobSeekerId;
    if (!jobseekerId) return res.status(403).json({ message: "Unauthorized" });

    const experiences = await JobseekerExperience.findAll({
      where: { jobseekerId },
      include: [
        { model: City, as: "city", attributes: ["cityName"] },
        { model: Country, as: "country", attributes: ["countryName"] },
      ],
      order: [["startDate", "DESC"]],
    });

    const formatted = experiences.map(exp => ({
      workId: exp.workId,
      jobTitle: exp.jobTitle,
      companyName: exp.companyName,
      departmentId: exp.departmentId,
      cityName: exp.city?.cityName,
      countryName: exp.country?.countryName,
      startDate: exp.startDate,
      isCurrent: exp.isCurrent,
      endDate: exp.endDate,
      description: exp.description,
    }));

    res.status(200).json({ experiences: formatted });
  } catch (error) {
    console.error("getMyProfessionalExperiences error:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};
exports.getMyExperienceById = async (req, res) => {
  try {
    const { experienceId } = req.query;
    const jobseekerId = req.user.jobSeekerId;

    const experience = await JobseekerExperience.findOne({
      where: {
        workId: experienceId,
        jobseekerId,
      },
      include: [
        { model: City, as: "city", attributes: ["cityName"] },
        { model: Country, as: "country", attributes: ["countryName"] },
      ],
    });

    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    res.status(200).json({
      workId: experience.workId,
      jobTitle: experience.jobTitle,
      companyName: experience.companyName,
      departmentId: experience.departmentId,
      cityName: experience.city?.cityName,
      countryName: experience.country?.countryName,
      startDate: experience.startDate,
      isCurrent: experience.isCurrent,
      endDate: experience.endDate,
      description: experience.description,
    });
  } catch (error) {
    console.error("getExperienceById error:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};
exports.getAllExperiencesOfjobSeekerById = async (req, res) => {
  try {
    const { jobSeekerId } = req.query;

    const experiences = await JobseekerExperience.findAll({
      where: { jobseekerId: jobSeekerId },
      include: [
        { model: City, as: "city", attributes: ["cityName"] },
        { model: Country, as: "country", attributes: ["countryName"] },
      ],
      order: [["startDate", "DESC"]],
    });

    const formatted = experiences.map(exp => ({
      workId: exp.workId,
      jobTitle: exp.jobTitle,
      companyName: exp.companyName,
      departmentId: exp.departmentId,
      cityName: exp.city?.cityName,
      countryName: exp.country?.countryName,
      startDate: exp.startDate,
      isCurrent: exp.isCurrent,
      endDate: exp.endDate,
      description: exp.description,
    }));

    res.status(200).json({ experiences: formatted });
  } catch (error) {
    console.error("getJobSeekerExperiencesById error:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

// DELETE /api/experience/:workId
exports.deleteProfessionalExperience = async (req, res) => {
  try {
    const { workId } = req.query;

    // ✅ Check if experience exists
    const experience = await JobseekerExperience.findByPk(workId);
    if (!experience) {
      return res.status(404).json({ message: "Experience not found." });
    }

    // ✅ Delete
    await experience.destroy();

    res.status(200).json({
      message: "Professional experience deleted successfully.",
    });
  } catch (error) {
    console.error("deleteProfessionalExperience error:", error);
    res.status(500).json({
      message: "Internal server error while deleting professional experience",
      details: error.message,
    });
  }
};


// PUT /api/experience/:workId
exports.editProfessionalExperience = async (req, res) => {
  try {
    const { workId } = req.query;
    const {
      jobTitle,
      companyName,
      departmentId,
      cityName,
      countryName,
      startDate,
      endDate,
      isCurrent,
      description,
      updateLocationInUser,
    } = req.body;
    const experience = await JobseekerExperience.findByPk(workId);
    if (!experience) {
      return res.status(404).json({ message: "Experience not found." });
    }
    const validationErrors = [];

const trimmedCompanyName = companyName?.trim();
const trimmedDescription = description?.trim();
const today = new Date();
today.setHours(0, 0, 0, 0);

// Required fields
if (!jobTitle || !trimmedCompanyName || !departmentId || !startDate || isCurrent === undefined) {
  validationErrors.push("Missing required fields.");
}

// 🔹 Company name check
if (
  /^\d+$/.test(trimmedCompanyName) ||
  trimmedCompanyName.length === 1 ||
  /^[^a-zA-Z0-9]$/.test(trimmedCompanyName)
) {
  validationErrors.push("companyName must not be only numbers, a single char, or a symbol.");
}

// 🔹 Description check (optional)
if (trimmedDescription && (
  /^\d+$/.test(trimmedDescription) ||
  /^[^a-zA-Z0-9]$/.test(trimmedDescription)
)) {
  validationErrors.push("description must not be only numbers or a single special character.");
}

// 🔹 startDate validation
const parsedStart = new Date(startDate);
parsedStart.setHours(0, 0, 0, 0);

if (isNaN(parsedStart.getTime())) {
  validationErrors.push("startDate must be a valid date.");
} else if (parsedStart > today) {
  validationErrors.push("startDate cannot be in the future.");
}

// 🔹 endDate validation (if not current)
if (!isCurrent) {
  if (!endDate) {
    validationErrors.push("endDate is required if isCurrent is false.");
  } else {
    const parsedEnd = new Date(endDate);
    parsedEnd.setHours(0, 0, 0, 0);

    if (isNaN(parsedEnd.getTime())) {
      validationErrors.push("endDate must be a valid date.");
    } else if (parsedEnd < parsedStart) {
      validationErrors.push("endDate must be after or equal to startDate.");
    }
  }
}

// ❌ Return if any validation fails
if (validationErrors.length > 0) {
  return res.status(400).json({
    message: "Validation failed.",
    errors: validationErrors,
  });
}
    // ✅ Find the existing experience
    

    // ✅ Find or create Country
    const [country] = await Country.findOrCreate({
      where: { countryName: countryName.trim() },
      defaults: { countryName: countryName.trim() },
    });

    // ✅ Find or create City
    const [city] = await City.findOrCreate({
      where: {
        cityName: cityName.trim(),
        countryId: country.countryId,
      },
      defaults: {
        cityName: cityName.trim(),
        countryId: country.countryId,
      },
    });
    const cleanedDescription =
  description && trimmedDescription !== "" ? trimmedDescription: null;


    // ✅ Update experience
    await experience.update({
      jobTitle,
      companyName,
      departmentId,
      cityId: city.cityId,
      countryId: country.countryId,
      startDate,
      endDate: isCurrent ? null : endDate,
      isCurrent,
      description: cleanedDescription,
    });

    // ✅ Optionally update user's current location
    if (updateLocationInUser) {
      await User.update(
        {
          cityId: city.cityId,
          countryId: country.countryId,
        },
        { where: { userId: req.user.userId } }
      );
    }

    res.status(200).json({
      message: "Professional experience updated successfully.",
      experience,
    });
  } catch (error) {
    console.error("editProfessionalExperience error:", error);
    res.status(500).json({
      message: "Internal server error while editing professional experience",
      details: error.message,
    });
  }
};
//languages

exports.addJobSeekerLanguages = async (req, res) => {
  try {
    const jobSeekerId = req.user.jobSeekerId;
    const { languages = [] } = req.body;

    if (!jobSeekerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!Array.isArray(languages) || languages.length === 0) {
      return res.status(400).json({ message: "Languages list is required and must be an array" });
    }

    for (const lang of languages) {
      const { languageId, level } = lang;

      if (!languageId || !level || level < 1 || level > 5) {
        return res.status(400).json({ message: "Each language must have a valid languageId and level (1-5)" });
      }

      const existing = await JobSeekerLanguage.findOne({
        where: { jobSeekerId, languageId },
      });

      if (existing) {
        // If same level, skip update
        if (existing.level === level) continue;

        // Update level
        await existing.update({ level });
      } else {
        // Insert new language
        await JobSeekerLanguage.create({
          jobSeekerId,
          languageId,
          level,
        });
      }
    }

    const updatedLanguages = await JobSeekerLanguage.findAll({
      where: { jobSeekerId },
      include: [{ model: Language, as: "language", attributes: ["languageId", "languageName"] }],
    });

    return res.status(200).json({
      message: "Languages updated successfully",
      languages: updatedLanguages.map(lang => ({
        languageId: lang.languageId,
        level: lang.level,
        languageName: lang.language?.languageName || null,
      })),
    });
  } catch (error) {
    console.error("addJobSeekerLanguages error:", error);
    return res.status(500).json({ message: "Internal server error", details: error.message });
  }
};
exports.deleteJobSeekerLanguage = async (req, res) => {
  try {
    const jobSeekerId = req.user.jobSeekerId;
    const { languageId } = req.query;

    if (!jobSeekerId || !languageId) {
      return res.status(400).json({ message: "Missing jobSeekerId or languageId." });
    }

    const deleted = await JobSeekerLanguage.destroy({
      where: {
        jobSeekerId,
        languageId
      }
    });

    if (!deleted) {
      return res.status(404).json({ message: "Language not found for this job seeker." });
    }

    return res.status(200).json({ message: "Language deleted successfully." });
  } catch (error) {
    console.error("deleteJobSeekerLanguage error:", error);
    return res.status(500).json({ message: "Failed to delete language.", details: error.message });
  }
};
exports.addEducation = async (req, res) => {
  try {
    const jobSeekerId = req.user.jobSeekerId;
    if (!jobSeekerId) return res.status(403).json({ message: "Unauthorized" });

    const {
      schoolName,
      cityName,
      countryName,
      degree,
      startDate,
      endDate,
      description,
    } = req.body;

    // Required fields
    const validationErrors = [];

const trimmedSchoolName = schoolName?.trim();
const trimmedDescription = description?.trim();
const today = new Date();
today.setHours(0, 0, 0, 0);

// 🔹 Required checks
if (!trimmedSchoolName || !cityName?.trim() || !countryName?.trim() || !startDate) {
  validationErrors.push("schoolName, cityName, countryName, and startDate are required.");
}

// 🔹 School name validation
if (
  /^\d+$/.test(trimmedSchoolName) ||
  trimmedSchoolName.length === 1 ||
  /^[^a-zA-Z0-9]$/.test(trimmedSchoolName)
) {
  validationErrors.push("schoolName must not be only numbers or a single symbol.");
}

// 🔹 Description validation (optional)
if (trimmedDescription && (
  /^\d+$/.test(trimmedDescription) ||
  trimmedDescription.length === 1 ||
  /^[^a-zA-Z0-9]$/.test(trimmedDescription)
)) {
  validationErrors.push("description must be meaningful, not just numbers or a single symbol.");
}

// 🔹 startDate validation
const parsedStart = new Date(startDate);
parsedStart.setHours(0, 0, 0, 0);

if (isNaN(parsedStart.getTime())) {
  validationErrors.push("startDate must be a valid date.");
} else if (parsedStart > today) {
  validationErrors.push("startDate cannot be in the future.");
}

// 🔹 endDate validation (if provided)
if (endDate) {
  const parsedEnd = new Date(endDate);
  parsedEnd.setHours(0, 0, 0, 0);

  if (isNaN(parsedEnd.getTime())) {
    validationErrors.push("endDate must be a valid date.");
  } else if (parsedEnd < parsedStart) {
    validationErrors.push("endDate must be after or equal to startDate.");
  }
}

// ❌ Early return if any validation fails
if (validationErrors.length > 0) {
  return res.status(400).json({
    message: "Validation failed.",
    errors: validationErrors,
  });
}


    // 🔍 Get or create country
    const [country] = await Country.findOrCreate({
      where: { countryName: countryName.trim() },
      defaults: { countryName: countryName.trim() },
    });

    // 🔍 Get or create city
    const [city] = await City.findOrCreate({
      where: {
        cityName: cityName.trim(),
        countryId: country.countryId,
      },
      defaults: {
        cityName: cityName.trim(),
        countryId: country.countryId,
      },
    });

    // 💾 Save the education entry
    const education = await JobseekerEducation.create({
      jobseekerId: jobSeekerId,
      schoolName: schoolName.trim(),
      degree: degree || null,
      startDate,
      endDate: endDate || null,
      description: trimmedDescription || null,
      cityId: city.cityId,
      countryId: country.countryId,
    });

    res.status(201).json({
      message: "Education added successfully",
      education,
    });

  } catch (error) {
    console.error("addEducation error:", error);
    res.status(500).json({
      message: "Error adding education entry",
      details: error.message,
    });
  }
};
// education
exports.getMyEducations = async (req, res) => {
  try {
    const jobSeekerId = req.user.jobSeekerId;

    const educations = await JobseekerEducation.findAll({
      where: { jobseekerId: jobSeekerId },
      include: [
        { model: City, as: "city", attributes: ["cityName"] },
        { model: Country, as: "country", attributes: ["countryName"] },
      ],
      order: [["startDate", "DESC"]],
    });

    const formatted = educations.map((edu) => ({
      educationId: edu.jobseekerEducationId,
      schoolName: edu.schoolName,
      degree: edu.degree,
      startDate: edu.startDate,
      endDate: edu.endDate,
      description: edu.description,
      cityName: edu.city?.cityName,
      countryName: edu.country?.countryName,
    }));

    res.status(200).json({ educations: formatted });
  } catch (error) {
    console.error("getMyEducations error:", error);
    res.status(500).json({ message: "Failed to fetch education history", details: error.message });
  }
};
exports.updateEducation = async (req, res) => {
  try {
    const { educationId } = req.query;
    const jobSeekerId = req.user.jobSeekerId;

    const {
      schoolName,
      cityName,
      countryName,
      degree,
      startDate,
      endDate,
      description,
    } = req.body;
const validationErrors = [];

const trimmedSchoolName = schoolName?.trim();
const trimmedDescription = description?.trim();
const today = new Date();
today.setHours(0, 0, 0, 0);

// 🔹 Required checks
if (!trimmedSchoolName || !cityName?.trim() || !countryName?.trim() || !startDate) {
  validationErrors.push("schoolName, cityName, countryName, and startDate are required.");
}

// 🔹 School name validation
if (
  /^\d+$/.test(trimmedSchoolName) ||
  trimmedSchoolName.length === 1 ||
  /^[^a-zA-Z0-9]$/.test(trimmedSchoolName)
) {
  validationErrors.push("schoolName must not be only numbers or a single symbol.");
}

// 🔹 Description validation (optional)
if (trimmedDescription && (
  /^\d+$/.test(trimmedDescription) ||
  trimmedDescription.length === 1 ||
  /^[^a-zA-Z0-9]$/.test(trimmedDescription)
)) {
  validationErrors.push("description must be meaningful, not just numbers or a single symbol.");
}

// 🔹 startDate validation
const parsedStart = new Date(startDate);
parsedStart.setHours(0, 0, 0, 0);

if (isNaN(parsedStart.getTime())) {
  validationErrors.push("startDate must be a valid date.");
} else if (parsedStart > today) {
  validationErrors.push("startDate cannot be in the future.");
}

// 🔹 endDate validation (if provided)
if (endDate) {
  const parsedEnd = new Date(endDate);
  parsedEnd.setHours(0, 0, 0, 0);

  if (isNaN(parsedEnd.getTime())) {
    validationErrors.push("endDate must be a valid date.");
  } else if (parsedEnd < parsedStart) {
    validationErrors.push("endDate must be after or equal to startDate.");
  }
}

// ❌ Early return if any validation fails
if (validationErrors.length > 0) {
  return res.status(400).json({
    message: "Validation failed.",
    errors: validationErrors,
  });
}

    const education = await JobseekerEducation.findOne({
      where: { jobseekerEducationId: educationId, jobseekerId: jobSeekerId }
    });
    
    if (!education) return res.status(404).json({ message: "Education record not found" });

    const [country] = await Country.findOrCreate({
      where: { countryName: countryName.trim() },
      defaults: { countryName: countryName.trim() },
    });

    const [city] = await City.findOrCreate({
      where: {
        cityName: cityName.trim(),
        countryId: country.countryId,
      },
      defaults: {
        cityName: cityName.trim(),
        countryId: country.countryId,
      },
    });

    await education.update({
      schoolName,
      degree: degree || null,
      startDate,
      endDate,
      description: description || null,
      cityId: city.cityId,
      countryId: country.countryId,
    });

    return res.status(200).json({ message: "Education updated successfully", education });
  } catch (error) {
    console.error("updateEducation error:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};
exports.getEducationById = async (req, res) => {
  try {
    const jobSeekerId = req.user.jobSeekerId;
    const {educationId }= req.query;

    if (!jobSeekerId) {
      return res.status(403).json({ message: "Unauthorized: JobSeeker ID missing" });
    }

    if (!educationId) {
      return res.status(400).json({ message: "Education ID is required" });
    }

    const education = await JobseekerEducation.findOne({
      where: {
        jobseekerEducationId: educationId,
        jobseekerId: jobSeekerId,
      },
      include: [
        { model: City, as: "city", attributes: ["cityId", "cityName"] },
        { model: Country, as: "country", attributes: ["countryId", "countryName"] },
      ],
    });

    if (!education) {
      return res.status(404).json({ message: "Education record not found" });
    }

    res.status(200).json({
      message: "Education record retrieved successfully",
      education,
    });

  } catch (error) {
    console.error("getEducationById error:", error);
    res.status(500).json({
      message: "Failed to retrieve education record",
      details: error.message,
    });
  }
};
exports.addJobSeekerSkills = async (req, res) => {
  try {
    const jobSeekerId = req.user.jobSeekerId;
    if (!jobSeekerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { skills = [] } = req.body;

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ message: "Please provide a non-empty skills array" });
    }

    const sanitizedSkills = skills
      .map(skill => typeof skill === "string" ? skill.trim() : null)
      .filter(skill => skill && skill.length > 0);

    const results = [];

    for (const skillName of sanitizedSkills) {
      const [record, created] = await JobSeekerSkills.findOrCreate({
        where: { jobSeekerId, skillName },
        defaults: { jobSeekerId, skillName }
      });
      results.push(record);
    }

    res.status(200).json({
      message: "Skills added successfully (duplicates skipped)",
      skills: results
    });
  } catch (error) {
    console.error("addJobSeekerSkills error:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};
exports.deleteEducationById = async (req, res) => {
  const { educationId } = req.query;
  const { jobSeekerId } = req.user; // ✅ must come from the token

  try {
    const education = await JobseekerEducation.findByPk(educationId);

    if (!education) {
      return res.status(404).json({ message: "Education not found." });
    }

    // ✅ Check ownership
    if (education.jobseekerId !== jobSeekerId) {
      return res.status(403).json({ message: "Unauthorized to delete this education." });
    }

    // ✅ Safe delete
    await JobseekerEducation.sequelize.transaction(async (transaction) => {
      await education.destroy({ transaction });
    });

    return res.status(200).json({ message: "Education deleted successfully." });

  } catch (error) {
    console.error("Delete Education Error:", error);
    return res.status(500).json({ message: "Failed to delete education.", error: error.message });
  }
};

//skills
exports.getMySkills = async (req, res) => {
  try {
    const jobSeekerId = req.user.jobSeekerId;
    if (!jobSeekerId) return res.status(403).json({ message: "Unauthorized" });

    const skills = await JobSeekerSkills.findAll({
      where: { jobSeekerId },
      attributes: ["jobSeekerSkillId", "skillName"]
    });

    res.status(200).json({ skills });
  } catch (error) {
    console.error("getMySkills error:", error);
    res.status(500).json({ message: "Failed to fetch skills", details: error.message });
  }
};
exports.deleteMySkill = async (req, res) => {
  try {
    const jobSeekerId = req.user.jobSeekerId;
    const { skillId } = req.query;

    if (!jobSeekerId) return res.status(403).json({ message: "Unauthorized" });

    const deletedCount = await JobSeekerSkills.destroy({
      where: {
        jobSeekerId,
        jobSeekerSkillId: skillId
      }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: "Skill not found or unauthorized" });
    }

    res.status(200).json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.error("deleteMySkill error:", error);
    res.status(500).json({ message: "Failed to delete skill", details: error.message });
  }
};
exports.updateEmail = async (req, res) => {
  try {
    const jobSeekerId = req.user.jobSeekerId;
    const { email } = req.body;

    // ✅ Basic validation
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // ✅ Find JobSeeker by userId
    const jobSeeker = await JobSeeker.findByPk(jobSeekerId);
    if (!jobSeeker) {
      return res.status(404).json({ message: "Job Seeker not found" });
    }

    // ✅ Update and save
    jobSeeker.email = email;
    await jobSeeker.save();

    return res.status(200).json({
      message: "Email updated successfully",
      email: jobSeeker.email,
    });

  } catch (error) {
    console.error("updateEmail error:", error);
    return res.status(500).json({
      message: "Failed to update email",
      details: error.message,
    });
  }
};

exports.updateUsername = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username } = req.body;

    if (!username) return res.status(400).json({ message: "Username is required" });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.username = username;
    await user.save();

    res.status(200).json({ message: "Username updated successfully", username: user.username });
  } catch (error) {
    console.error("updateUsername error:", error);
    res.status(500).json({ message: "Failed to update username", details: error.message });
  }
};
exports.updateProfessionalHeadline = async (req, res) => {
  try {
    const jobSeekerId = req.user.jobSeekerId;
    const { professionalHeadline } = req.body;

    if (!professionalHeadline) return res.status(400).json({ message: "professionalHeadline is required" });

    const jobSeeker = await JobSeeker.findByPk(jobSeekerId);
    if (!jobSeeker) return res.status(404).json({ message: "Job seeker not found" });

    jobSeeker.professionalHeadline = professionalHeadline;
    await jobSeeker.save();

    res.status(200).json({ message: "Professional headline updated", professionalHeadline });
  } catch (error) {
    console.error("updateProfessionalHeadline error:", error);
    res.status(500).json({ message: "Failed to update professionalHeadline", details: error.message });
  }
};
exports.updateLocation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cityName, countryName } = req.body;

    if (!cityName || !countryName) return res.status(400).json({ message: "City and country are required" });

    const [country] = await Country.findOrCreate({ where: { countryName: countryName.trim() } });
    const [city] = await City.findOrCreate({ where: { cityName: cityName.trim(), countryId: country.countryId } });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cityId = city.cityId;
    user.countryId = country.countryId;
    await user.save();

    res.status(200).json({ message: "Location updated successfully", city: city.cityName, country: country.countryName });
  } catch (error) {
    console.error("updateLocation error:", error);
    res.status(500).json({ message: "Failed to update location", details: error.message });
  }
};
exports.updatePhone = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { phoneCode, phoneNumber } = req.body;

    if (!phoneCode || !phoneNumber) {
      return res.status(400).json({ message: "Phone code and number are required" });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.phoneCode = phoneCode;
    user.phoneNumber = phoneNumber;
    await user.save();

    res.status(200).json({ message: "Phone updated successfully", phoneCode, phoneNumber });
  } catch (error) {
    console.error("updatePhone error:", error);
    res.status(500).json({ message: "Failed to update phone", details: error.message });
  }
};
exports.updateAboutMe = async (req, res) => {
  try {
    const jobSeekerId = req.user.jobSeekerId;
    const { aboutMe } = req.body;

    const jobSeeker = await JobSeeker.findByPk(jobSeekerId);
    if (!jobSeeker) return res.status(404).json({ message: "Job seeker not found" });

    jobSeeker.aboutMe = aboutMe;
    await jobSeeker.save();

    res.status(200).json({ message: "About me updated successfully", aboutMe });
  } catch (error) {
    console.error("updateAboutMe error:", error);
    res.status(500).json({ message: "Failed to update about me", details: error.message });
  }
};
// DELETE /api/jobseeker/about-me
exports.deleteAboutMe = async (req, res) => {
  try {
    const jobSeekerId = req.user.jobSeekerId; // ✅ from verifyToken

    if (!jobSeekerId) {
      return res.status(400).json({ message: "JobSeeker ID not found in token." });
    }

    const jobSeeker = await JobSeeker.findByPk(jobSeekerId);

    if (!jobSeeker) {
      return res.status(404).json({ message: "JobSeeker not found." });
    }

    // ✅ Clear the aboutMe field
    jobSeeker.aboutMe = null;
    await jobSeeker.save();

    res.status(200).json({
      message: "About Me section deleted successfully.",
    });

  } catch (error) {
    console.error("deleteAboutMe error:", error);
    res.status(500).json({
      message: "Internal server error while deleting About Me.",
      details: error.message,
    });
  }
};



exports.addNationalitiesAndInfo = async (req, res) => {
  try {
    const { userId, jobSeekerId } = req.user;
    const { nationalityIds, workPermitCountryNames, dateOfBirth, hasDrivingLicense } = req.body;

    if (!userId || !jobSeekerId) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    const jobSeeker = await JobSeeker.findByPk(jobSeekerId);
    if (!jobSeeker) {
      return res.status(404).json({ message: "JobSeeker not found." });
    }

    // ✅ Validate dateOfBirth format and minimum age
    if (dateOfBirth) {
      const isValidDate = moment(dateOfBirth, "YYYY-MM-DD", true).isValid();

      if (!isValidDate) {
        return res.status(400).json({ message: "Invalid date format. Date must be in YYYY-MM-DD format." });
      }

      const birthDate = moment(dateOfBirth, "YYYY-MM-DD");
      const today = moment();
      const age = today.diff(birthDate, 'years');

      if (age < 16) {
        return res.status(400).json({ message: "User must be at least 16 years old." });
      }

      jobSeeker.dateOfBirth = dateOfBirth;
    }

    if (typeof hasDrivingLicense === "boolean") {
      jobSeeker.hasDrivingLicense = hasDrivingLicense;
    }

    await jobSeeker.save();

    // ✅ Handle Nationalities
    if (Array.isArray(nationalityIds)) {
      await JobSeekerNationality.destroy({ where: { jobSeekerId } });

      if (nationalityIds.length > 0) {
        const nationalityData = nationalityIds.map(nationalityId => ({
          jobSeekerId,
          nationalityId,
        }));

        try {
          await JobSeekerNationality.bulkCreate(nationalityData);
        } catch (error) {
          console.error("Error inserting nationalities:", error);
          return res.status(400).json({ message: "Invalid nationality IDs provided." });
        }
      }
    }

    // ✅ Handle Work Permits (by Country Names)
    if (Array.isArray(workPermitCountryNames)) {
      await JobSeekerWorkPermit.destroy({ where: { jobSeekerId } });

      if (workPermitCountryNames.length > 0) {
        const workPermitData = [];

        for (const countryName of workPermitCountryNames) {
          if (!countryName || countryName.trim() === "") continue;

          let country = await Country.findOne({ where: { countryName: countryName.trim() } });

          if (!country) {
            // Insert the country if it doesn't exist
            country = await Country.create({ countryName: countryName.trim() });
          }

          workPermitData.push({
            jobSeekerId,
            countryId: country.countryId
          });
        }

        try {
          if (workPermitData.length > 0) {
            await JobSeekerWorkPermit.bulkCreate(workPermitData);
          }
        } catch (error) {
          console.error("Error inserting work permits:", error);
          return res.status(400).json({ message: "Failed inserting work permits." });
        }
      }
    }

    res.status(200).json({ message: "Profile information updated successfully." });

  } catch (error) {
    console.error("Fatal error adding nationalities and info:", error);
    res.status(500).json({ message: "Server error updating profile information." });
  }
};

exports.getMyFullJobSeekerProfile = async (req, res) => {
  try {
    const jobSeekerId = req.user.jobSeekerId;
    if (!jobSeekerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const jobSeeker = await JobSeeker.findByPk(jobSeekerId, {
      attributes: { exclude: ['userId'] },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["username", "email", "phoneCode", "phoneNumber","imageUrl"],
          include: [
            { model: Country, as: "country", attributes: ["countryName"] },
            { model: City, as: "city", attributes: ["cityName"] }
          ]
        },
        {
          model: JobSeekerSkills,
          as: "skills",
          attributes: ["jobSeekerSkillId","skillName"]
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
          through: { attributes: ["level"] }, // from JobSeekerLanguage
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
            {
              model: Country,
              as: "country",
              attributes: ["countryId", "countryName"]
            }
          ]
        }
      ]
    });

    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker profile not found" });
    }

    res.status(200).json({ profile: jobSeeker });
  } catch (error) {
    console.error("getFullJobSeekerProfile error:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};
exports.getAllNationalities = async (req, res) => {
  try {
    const nationalities = await Nationality.findAll({
      attributes: ["nationalityId", "nationalityName"],
      order: [["nationalityName", "ASC"]] // optional: order alphabetically
    });

    res.status(200).json({ nationalities });
  } catch (error) {
    console.error("Error fetching nationalities:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

// ✅ Get all skills
exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skills.findAll({
      attributes: ["skillsId", "skillsName"],
      order: [["skillsName", "ASC"]] // optional: order alphabetically
    });

    res.status(200).json({ skills });
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

exports.saveJob = async (req, res) => {
  try {
    const jobSeekerId = req.user.jobSeekerId;
    const { jobId } = req.query;
    // Check if job exists and is open
        const job = await Job.findOne({ where: { jobId } });

    if (!jobSeekerId || !jobId) {
      return res.status(400).json({ message: "JobSeeker ID and Job ID are required" });
    }
    console.log(job.statusId)
    if (!(job.statusId==1||job.statusId==2)) { // Assuming 1 = Open
      return res.status(400).json({ message: "we can not save this job" });
    }


    // Check for duplicates
    const alreadySaved = await SavedJob.findOne({
      where: { jobSeekerId, jobId },
    });

    if (alreadySaved) {
      return res.status(409).json({ message: "This job is already saved" });
    }

    await SavedJob.create({ jobSeekerId, jobId });

    return res.status(201).json({ message: "Job saved successfully" });
  } catch (error) {
    console.error("Error saving job:", error);
    return res.status(500).json({ message: "Server error while saving job" });
  }
};


exports.unsaveJob = async (req, res) => {
  try {
    const jobSeekerId = req.user.jobSeekerId;
    const { jobId } = req.query;

    if (!jobSeekerId || !jobId) {
      return res.status(400).json({ message: "JobSeeker ID and Job ID are required" });
    }

    const savedJob = await SavedJob.findOne({
      where: { jobSeekerId, jobId },
    });

    if (!savedJob) {
      return res.status(404).json({ message: "Saved job not found" });
    }

    await savedJob.destroy();

    return res.status(200).json({ message: "Job unsaved successfully" });
  } catch (error) {
    console.error("Error unsaving job:", error);
    return res.status(500).json({ message: "Server error while unsaving job" });
  }
};
exports.getSavedJobsForJobSeeker = async (req, res) => {
  try {
    const jobSeekerId = req.user.jobSeekerId;

    if (!jobSeekerId) {
      return res.status(401).json({ message: "Unauthorized: JobSeeker ID missing from token" });
    }

    const savedJobs = await SavedJob.findAll({
      where: { jobSeekerId },
      attributes: [], // We don't care about SavedJob fields
      include: [
        {
          model: Job,
          as: "job",
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
                "createdAt"
              ],
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
      ]
    });

    // Extract jobs only
    const jobs = savedJobs.map(entry => entry.job);

    return res.status(200).json({ savedJobs: jobs });
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    return res.status(500).json({ message: "Server error while retrieving saved jobs" });
  }
};
