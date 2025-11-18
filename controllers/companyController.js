"use strict";
const {sequelize} = require("../models");
const { Op } = require("sequelize");
const Type = require("../models/CompanyRelations/CompanyType/Types");
const CompanySize = require("../models/CompanyRelations/CompanySize/CompanySize");
const cloudinary = require("../config/cloudinary");
const { User, City, Country, CompanyKeyFact,CompanyAlbum,CompanyAlbumPhoto } = require("../models");
const {
  Job,
  ContractType,
  StatusJob,
  ContractDuration,
  MinimumSeniority,
  Company
} = require("../models");
const JobApplication=require("../models/jobRelations/JobApplication")

const { JobSeeker } = require("../models");
const { v4: uuidv4 } = require('uuid');

function extractPublicId(url, folderName) {
  if (!url || !folderName) return null;
  const regex = new RegExp(`${folderName}/([^/.]+)`);
  const match = url.match(regex);
  return match ? `${folderName}/${match[1]}` : null;
}


exports.createCompany = async (req, res) => {
  try {
    const {
      companyName,
      sizeId,
      foundedYear,
      companyDescription,
      locations,
      typeId,
    } = req.body;

    const userId = req.user.userId; // ✅ secure from token
    const validationErrors = [];
    const trimmedName=companyName.trim();

    if (!companyName || trimmedName === "")
      validationErrors.push("companyName is required.");
    if (/^\d+$/.test(trimmedName)) {
      validationErrors.push("Company name cannot contain only numbers.");
    }
    if (foundedYear && foundedYear > new Date().getFullYear())
      validationErrors.push("foundedYear cannot be in the future.");
    if (locations && !Array.isArray(locations))
      validationErrors.push("locations must be an array.");
    if (sizeId) {
      const sizeExists = await CompanySize.findByPk(sizeId);
      if (!sizeExists)
        validationErrors.push("Selected company size does not exist.");
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ message: "Validation errors", errors: validationErrors });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.role !== "company") {
      return res.status(400).json({
        message: "User role must be 'company' to create a company profile.",
      });
    }

    let company = await Company.findOne({ where: { userId } });

    if (company) {
      await company.update({
        companyName: companyName ?? company.companyName,
        sizeId: sizeId ?? company.sizeId,
        foundedYear: foundedYear ?? company.foundedYear,
        companyDescription: companyDescription ?? company.companyDescription,
        typeId: typeId ?? company.typeId,
      });

      if (Array.isArray(locations)) {
        await CompanyLocations.destroy({ where: { companyId: company.companyId } });
        const locationData = await resolveLocationData(locations, company.companyId);
        await CompanyLocations.bulkCreate(locationData);
      }

      return res.status(200).json({ message: "Company updated successfully.", company });
    }

    company = await Company.create({
      userId,
      companyName,
      sizeId: sizeId ?? null,
      foundedYear: foundedYear ?? 2000,
      companyDescription,
      typeId: typeId || null,
    });

    if (Array.isArray(locations)) {
      const locationData = await resolveLocationData(locations, company.companyId);
      await CompanyLocations.bulkCreate(locationData);
    }

    // Create Cloudinary folder
    const dummyBuffer = Buffer.from("placeholder");
    const folderName = `job_application_resumes_${company.companyName.replace(/[^\w\s-]/gi, "").replace(/\s+/g, "_")}`;

    await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          public_id: "init",
          resource_type: "raw",
        },
        async (error, result) => {
          if (error) return reject(error);
          await cloudinary.uploader.destroy(`${folderName}/init`, { resource_type: "raw" });
          resolve(result);
        }
      ).end(dummyBuffer);
    });

    return res.status(201).json({ message: "Company created successfully", company });
  } catch (error) {
    console.error("\nERROR CREATING/UPDATING COMPANY:", error);
    res.status(500).json({ message: "Error creating/updating company", details: error.message });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const {
      companyName,
      sizeId,
      foundedYear,
      companyDescription,
      locations,
      typeId,
    } = req.body;

    const userId = req.user.userId;
    const validationErrors = [];

    if (foundedYear && foundedYear > new Date().getFullYear())
      validationErrors.push("foundedYear cannot be in the future.");
    if (locations && !Array.isArray(locations))
      validationErrors.push("locations must be an array.");
    if (sizeId) {
      const sizeExists = await CompanySize.findByPk(sizeId);
      if (!sizeExists)
        validationErrors.push("Selected company size does not exist.");
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ message: "Validation errors", errors: validationErrors });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.role !== "company") {
      return res.status(400).json({
        message: "User role must be 'company' to update a company profile.",
      });
    }

    const company = await Company.findOne({ where: { userId } });
    if (!company) return res.status(404).json({ message: "Company not found." });

    await company.update({
      companyName: companyName ?? company.companyName,
      sizeId: sizeId ?? company.sizeId,
      foundedYear: foundedYear ?? company.foundedYear,
      companyDescription: companyDescription ?? company.companyDescription,
      typeId: typeId ?? company.typeId,
    });

    if (Array.isArray(locations)) {
      await CompanyLocations.destroy({ where: { companyId: company.companyId } });
      const locationData = await resolveLocationData(locations, company.companyId);
      await CompanyLocations.bulkCreate(locationData);
    }

    return res.status(200).json({ message: "Company updated successfully.", company });
  } catch (error) {
    console.error("\nERROR UPDATING COMPANY:", error);
    res.status(500).json({ message: "Error updating company", details: error.message });
  }
};

exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      attributes: [
        "companyId",
        "companyName",
        "companyDescription",
        "createdAt",
        "verified",
        "hasPremiumPlan",
        "premiumSince",
        "premiumExpires",
        "backgroundImageUrl",
        "mediaUrl",
        "mediaType",
        "address",
        "googlePlaceId",
        "latitude",
        "longitude",
        "jobLimit",
      ],
      include: [
        {
          model: CompanyKeyFact,
          as: "keyFacts",
          attributes: ["id", "label", "value"],
        },
        {
          model: User,
          as: "user",
          attributes: [
            "userId",
            "username",
            "email",
            "is_verified",
            "phoneCode",
            "phoneNumber",
            "cityId",
            "countryId",
            "imageUrl",
          ],
          include: [
            { model: Country, as: "country", attributes: ["countryName"] },
            { model: City, as: "city", attributes: ["cityName"] },
          ],
        },
        {
          model: CompanySize,
          as: "companySize",
          attributes: ["sizeName"],
        },
        {
          model: Type,
          as: "type",
          attributes: ["typeName"],
        },
      ],
    });

    if (!companies.length) {
      return res.status(404).json({ message: "No companies found." });
    }

    // Enrich each company with job counts
    const enrichedCompanies = await Promise.all(
      companies.map(async (company) => {
        const jobs = await Job.findAll({
          where: { companyId: company.companyId },
          attributes: ["statusId"],
        });

        const jobStatusCounts = {
          open: 0,
          closed: 0,
          expired: 0,
        };

        for (const job of jobs) {
          switch (job.statusId) {
            case 1: jobStatusCounts.open++; break;
            case 2: jobStatusCounts.closed++; break;
            // statusId 4 (draft) intentionally ignored
          }
        }

        const totalJobs = jobStatusCounts.open + jobStatusCounts.closed + jobStatusCounts.expired;

        // Use .toJSON() to avoid mutating {sequelize} model instance
        const companyData = company.toJSON();
        companyData.jobStatusCounts = jobStatusCounts;
        companyData.totalJobs = totalJobs;

        return companyData;
      })
    );

    return res.status(200).json(enrichedCompanies);
  } catch (error) {
    console.error("Error retrieving companies:", error);
    return res.status(500).json({
      message: "Error retrieving companies",
      details: error.message,
    });
  }
};

exports.uploadCompanyBackgroundImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(403).json({ message: "Unauthorized: Company ID not found" });
    }

    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const folder = `company_Background`;

    // ✅ Delete old background image if exists
    if (company.backgroundImageUrl) {
      const publicId = extractPublicId(company.backgroundImageUrl, folder);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      }
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          width: 500,
          crop: "scale",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    company.backgroundImageUrl = result.secure_url;
    await company.save();

    res.status(200).json({
      message: "Background image uploaded successfully",
      imageUrl: company.backgroundImageUrl,
    });

  } catch (error) {
    console.error("Image Upload Error:", error);
    res.status(500).json({ message: "Failed to upload image", error: error.message });
  }
};
exports.deleteCompanyBackgroundImage = async (req, res) => {
  try {
    const { companyId } = req.user;

    if (!companyId) {
      return res.status(403).json({ message: "Unauthorized: Company ID not found" });
    }

    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    if (!company.backgroundImageUrl) {
      return res.status(400).json({ message: "No background image to delete" });
    }

    const publicId = extractPublicId(company.backgroundImageUrl, "company_Background");
    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    }

    company.backgroundImageUrl = null;
    await company.save();

    res.status(200).json({ message: "Background image deleted successfully" });
  } catch (error) {
    console.error("Delete Background Image Error:", error);
    res.status(500).json({ message: "Failed to delete background image", error: error.message });
  }
};



exports.createCompanyKeyFact = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { label, value } = req.body;

    if (!label || !value) {
      return res.status(400).json({ message: "Label and value are required." });
    }

    // Check for duplicate key fact by label (case-insensitive)
    const existing = await CompanyKeyFact.findOne({
      where: {
        companyId,
        label: { [Op.iLike]: label.trim() }   }
    });

    if (existing) {
      return res.status(409).json({ message: "This key fact label already exists." });
    }

    const keyFact = await CompanyKeyFact.create({
      companyId,
      label,
      value,
    });

    return res.status(201).json({ message: "Key fact created successfully.", keyFact });
  } catch (error) {
    console.error("Create Key Fact Error:", error);
    res.status(500).json({ message: "Failed to create key fact", error: error.message });
  }
};
exports.deleteKeyFactById = async (req, res) => {
  try {
    const { keyFactId } = req.query;
    const { companyId } = req.user; 
    if (!companyId) {
      return res.status(404).json({ message: "should be authorized company to delete" });
    }

    const keyFact = await CompanyKeyFact.findOne({
      where: {
        id: keyFactId,     // Replace "id" by your actual primary key field name
        companyId: companyId
      }
    });

    if (!keyFact) {
      return res.status(404).json({ message: "Key fact not found or you don't have permission" });
    }

    await keyFact.destroy();

    res.status(200).json({ message: "Key fact deleted successfully" });
  } catch (error) {
    console.error('Error deleting key fact:', error);
    res.status(500).json({ message: "Failed to delete key fact" });
  }
};
exports.editCompanyName = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { companyName } = req.body;

    if (!companyName || typeof companyName !== "string" || companyName.trim() === "") {
      return res.status(400).json({ message: "Company name is required." });
    }
    const trimmedName = companyName.trim();

    // Validation: name should not be only numbers
    if (/^\d+$/.test(trimmedName)) {
      return res.status(400).json({ message: "Company name cannot contain only numbers." });
    }

    // Validation: name should not be too long
    if (trimmedName.length > 50) {
      return res.status(400).json({ message: "Company name cannot exceed 100 characters." });
    }

    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    company.companyName = companyName.trim();
    await company.save();

    return res.status(200).json({ message: "Company name updated successfully.", companyName: company.companyName });
  } catch (error) {
    console.error("Edit Company Name Error:", error);
    return res.status(500).json({ message: "Failed to update company name", error: error.message });
  }
};
exports.updateCompanyDescription = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { companyDescription } = req.body;

    if (companyDescription===undefined || !companyId) {
      return res.status(400).json({ message: "Missing companyId or description" });
    }

    const company = await Company.findByPk(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    await company.update({ companyDescription });
    res.status(200).json({ message: "Company description updated successfully" });
  } catch (error) {
    console.error("Update Company Description Error:", error);
    res.status(500).json({ message: "Failed to update description", error: error.message });
  }
};



// 🔁 Shared Helper
async function resolveLocationData(locations, companyId) {
  return Promise.all(
    locations.map(async ({ city, country }) => {
      let countryRecord = await Country.findOne({ where: { countryName: country } });
      if (!countryRecord) {
        countryRecord = await Country.create({ countryName: country });
      }

      let cityRecord = await City.findOne({
        where: { cityName: city, countryId: countryRecord.countryId },
      });

      if (!cityRecord) {
        cityRecord = await City.create({
          cityName: city,
          countryId: countryRecord.countryId,
        });
      }

      return { companyId, cityId: cityRecord.cityId };
    })
  );
}

exports.deleteCompany = async (req, res) => {
  try {
    const { userId } = req.params;

    const company = await Company.findOne({ where: { userId } });
    if (!company)
      return res.status(404).json({ message: "Company profile not found" });

    await company.destroy();
    await User.destroy({ where: { userId } });

    res.status(200).json({ message: "Company and User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting company", details: error.message });
  }
};

exports.getCompanyProfile = async (req, res) => {
  try {
    const { companyId } = req.query;

    const company = await Company.findByPk(companyId, {
      attributes: [
        "companyId",
        "companyName",
        "companyDescription",
        "createdAt",
        "verified",
        "hasPremiumPlan",
        "premiumSince",
        "premiumExpires",
        "backgroundImageUrl",
        "mediaUrl",
        "mediaType",
        "address",
        "googlePlaceId",
        "latitude",
        "longitude",
        "jobLimit",
      ],
      include: [
        {
          model: CompanyKeyFact,
          as: "keyFacts",
          attributes: ["id", "label", "value"]
        },
        {
          model: User,
          as: "user",
          attributes: [
            "userId", "username", "email", "is_verified",
            "phoneCode", "phoneNumber", "cityId", "countryId", "imageUrl"
          ],
          include: [
            { model: Country, as: "country", attributes: ["countryName"] },
            { model: City, as: "city", attributes: ["cityName"] }
          ]
        },
        { model: CompanySize, as: "companySize", attributes: ["sizeName"] },
        { model: Type, as: "type", attributes: ["typeName"] }
      ]
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Get jobs for this company (only statuses open, closed, expired)
    const jobs = await Job.findAll({
      where: { companyId },
      attributes: ["statusId"]
    });

    const jobStatusCounts = {
      open: 0,
      closed: 0,
      expired: 0
    };

    for (const job of jobs) {
      switch (job.statusId) {
        case 1: // Open
          jobStatusCounts.open++;
          break;
        case 2: // Closed
          jobStatusCounts.closed++;
          break;
        // Drafts (statusId = 4) not included for public profile
      }
    }

    const totalJobs = jobStatusCounts.open + jobStatusCounts.closed + jobStatusCounts.expired;

    // Build the full public company profile
    const profile = {
      companyId: company.companyId,
      companyName: company.companyName,
      companyDescription: company.companyDescription,
      createdAt: company.createdAt,
      verified: company.verified,
      hasPremiumPlan: company.hasPremiumPlan,
      premiumSince: company.premiumSince,
      premiumExpires: company.premiumExpires,
      jobLimit: company.jobLimit,

      // Media and visuals
      backgroundImageUrl: company.backgroundImageUrl,
      media: {
        url: company.mediaUrl,
        type: company.mediaType
      },

      // Address and map details
      address: company.address,
      googlePlaceId: company.googlePlaceId,
      latitude: company.latitude,
      longitude: company.longitude,

      // Company size and type
      companySize: company.companySize?.sizeName || null,
      companyType: company.type?.typeName || null,

      // Key facts
      keyFacts: company.keyFacts.map(fact => ({
        id: fact.id,
        label: fact.label,
        value: fact.value
      })),

      // User (account) info
      user: {
        userId: company.user.userId,
        username: company.user.username,
        email: company.user.email,
        isVerified: company.user.is_verified,
        phoneCode: company.user.phoneCode,
        phoneNumber: company.user.phoneNumber,
        imageUrl: company.user.imageUrl,
        location: `${company.user.city?.cityName || "N/A"}, ${company.user.country?.countryName || "N/A"}`
      },

      // Job status counters
      jobStatusCounts,
      totalJobs
    };

    return res.status(200).json(profile);

  } catch (error) {
    console.error("Get Company Profile Error:", error);
    res.status(500).json({ message: "Failed to fetch company profile", error: error.message });
  }
};


const path = require("path");



exports.uploadCompanyMedia = async (req, res) => {
  try {
    const { companyId } = req.user;
    const mediaType = req.query.type;

    if (!["image", "video"].includes(mediaType)) {
      return res.status(400).json({ message: "Invalid media type. Must be 'image' or 'video'." });
    }

    const company = await Company.findByPk(companyId);
    if (!company) return res.status(404).json({ message: "Company not found." });

    const mediaFolder = "company_media";

    // ✅ Remove old image from Cloudinary if exists
    if (company.mediaUrl && company.mediaType === "image") {
      const publicId = extractPublicId(company.mediaUrl, mediaFolder);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      }
    }

    if (mediaType === "video") {
      const { videoUrl } = req.body;
      const isYouTube = /^https:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/.test(videoUrl);

      if (!isYouTube) {
        return res.status(400).json({ message: "Only YouTube video URLs are allowed." });
      }

      await company.update({ mediaUrl: videoUrl, mediaType: "video" });
      return res.status(200).json({ message: "YouTube video link saved successfully.", mediaUrl: videoUrl });
    }

    // ✅ Handle image upload
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required." });
    }

    const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!validExtensions.includes(ext)) {
      return res.status(400).json({ message: "Invalid image type. Allowed: jpg, jpeg, png, webp" });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: mediaFolder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    await company.update({ mediaUrl: result.secure_url, mediaType: "image" });

    return res.status(200).json({
      message: "Image uploaded successfully",
      mediaUrl: result.secure_url,
    });

  } catch (error) {
    console.error("Upload Company Media Error:", error);
    res.status(500).json({ message: "Media upload failed", error: error.message });
  }
};
// controllers/companyController.js
exports.deleteUploadedMedia = async (req, res) => {
  try {
    const { companyId } = req.user; 
    if (!companyId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // If no media found
    if (!company.mediaUrl || !company.mediaType) {
      return res.status(400).json({ message: "No media to delete" });
    }

    if (company.mediaType === 'image') {
      // Delete from Cloudinary
      const publicId = extractPublicId(company.mediaUrl, 'company_media');
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      }
    }

    // If it's a video, we don't touch Cloudinary (only remove from DB)

    // Clear fields in database (for both image and video)
    company.mediaUrl = null;
    company.mediaType = null;
    await company.save();

    res.status(200).json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ message: "Failed to delete media" });
  }
}

exports.getCompanyJobApplicationsByStatus = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { status } = req.query;

    const validStatuses = ["Pending", "Viewed", "Hired", "Rejected"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // 🧠 Get all job IDs for this company
    const jobs = await Job.findAll({
      where: { companyId },
      attributes: ["jobId"],
    });
    const jobIds = jobs.map((job) => job.jobId);

    // ✅ Get applications for those jobs with the requested status
    const applications = await JobApplication.findAll({
      where: {
        jobId: jobIds,
        status,
      },
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["jobId", "jobTitle", "description", "startDate"],
          include: [
            { model: StatusJob, as: "statusJob", attributes: ["statusName"] },
            { model: ContractType, as: "contractType", attributes: ["type"] },
            { model: MinimumSeniority, as: "minimumSeniority", attributes: ["seniorityLevel"] },
            { model: ContractDuration, as: "contractDuration", attributes: ["durationType"] },
          ],
        },
        {
          model: JobSeeker,
          as: "jobseeker",
          include: [
            {
              model: User,
              as: "user", // ✅ fixed alias
              attributes: [
                "userId",
                "firstName",
                "lastName",
                "email",
                "imageUrl",
                "phoneCode",
                "phoneNumber",
              ],
              include: [
                { model: City, as: "city", attributes: ["cityName"] },
                { model: Country, as: "country", attributes: ["countryName"] },
              ],
            },
          ],
        },
      ],
      order: [["applicationDate", "DESC"]],
    });

    res.status(200).json({ applications });
  } catch (error) {
    console.error("Error in getCompanyJobApplicationsByStatus:", error);
    res.status(500).json({ message: "Failed to fetch job applications" });
  }
};
exports.getMyCompanyProfile = async (req, res) => {
  try {
    const { companyId } = req.user;

    const company = await Company.findByPk(companyId, {
      attributes: [
        "companyId",
        "companyName",
        "companyDescription",
        "createdAt",
        "verified",
        "hasPremiumPlan",
        "premiumSince",
        "premiumExpires",
        "backgroundImageUrl",
        "mediaUrl",
        "mediaType",
        "address",
        "googlePlaceId",
        "latitude",
        "longitude",
        "jobLimit",
      ],
      include: [
        {
          model: CompanyKeyFact,
          as: "keyFacts",
          attributes: ["label", "value"]
        },
        {
          model: User,
          as: "user",
          attributes: [
            "userId", "username", "email", "is_verified", 
            "phoneCode", "phoneNumber", "cityId", "countryId", "imageUrl"
          ],
          include: [
            { model: Country, as: "country", attributes: ["countryName"] },
            { model: City, as: "city", attributes: ["cityName"] }
          ]
        },
        { model: CompanySize, as: "companySize", attributes: ["sizeName"] },
        { model: Type, as: "type", attributes: ["typeName"] }
      ]
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Get all jobs posted by this company
    const jobs = await Job.findAll({
      where: { companyId },
      attributes: ["jobId", "statusId"]
    });

    const jobStatusCounts = {
      open: 0,
      closed: 0,
      expired: 0,
      draft: 0
    };

    for (const job of jobs) {
      switch (job.statusId) {
        case 2: // Open
          jobStatusCounts.open++;
          break;
        case 3: // Closed
          jobStatusCounts.closed++;
          break;
        case 4: // Expired
          jobStatusCounts.expired++;
          break;
        case 5: // Draft
          jobStatusCounts.draft++;
          break;
      }
    }

    const jobIds = jobs.map(job => job.jobId);

    // Total applications on company's jobs
    let totalJobApplications = 0;
    let totalApplicants = 0;
    
    if (jobIds.length > 0) {
      totalJobApplications = await JobApplication.count({
        where: { jobId: { [Op.in]: jobIds } }
      });
    
      const applicants = await JobApplication.findAll({
        where: { jobId: { [Op.in]: jobIds}, status: { [Op.not]: "Rejected" } },
        attributes: ["jobseekerId"],
        group: ["jobseekerId"]
      });
      totalApplicants = applicants.length;
    }

    // Build final full profile
    const profile = {
      companyId: company.companyId,
      companyName: company.companyName,
      companyDescription: company.companyDescription,
      createdAt: company.createdAt,
      verified: company.verified,
      hasPremiumPlan: company.hasPremiumPlan,
      premiumSince: company.premiumSince,
      premiumExpires: company.premiumExpires,
      jobLimit: company.jobLimit,

      // Background and media
      backgroundImageUrl: company.backgroundImageUrl,
      media: {
        url: company.mediaUrl,
        type: company.mediaType
      },

      // Address and Google Maps info
      address: company.address,
      googlePlaceId: company.googlePlaceId,
      latitude: company.latitude,
      longitude: company.longitude,

      // Key facts
      keyFacts: company.keyFacts.map(fact => ({
        label: fact.label,
        value: fact.value
      })),

      // Company size and type
      companySize: company.companySize?.sizeName || null,
      companyType: company.type?.typeName || null,

      // User info (account)
      user: {
        userId: company.user.userId,
        username: company.user.username,
        email: company.user.email,
        isVerified: company.user.is_verified,
        phoneCode: company.user.phoneCode,
        phoneNumber: company.user.phoneNumber,
        imageUrl: company.user.imageUrl,
        location: `${company.user.city?.cityName || "N/A"}, ${company.user.country?.countryName || "N/A"}`
      },

      // Metrics
      jobStatusCounts,
      totalJobs: jobStatusCounts.open + jobStatusCounts.closed + jobStatusCounts.expired + jobStatusCounts.draft,
      totalOpenJobs: jobStatusCounts.open,
      totalClosedJobs: jobStatusCounts.closed,
      totalExpiredJobs: jobStatusCounts.expired,
      totalDraftJobs: jobStatusCounts.draft,
      totalJobApplications,
      totalApplicants,
    };

    return res.status(200).json(profile);

  } catch (error) {
    console.error("Get Company Profile Error:", error);
    res.status(500).json({ message: "Failed to fetch company profile", error: error.message });
  }
};

exports.updateCompanyAddress = async (req, res) => {
  try {
    const companyId = req.user.companyId; // ensure token includes companyId
    const { address, googlePlaceId, latitude, longitude } = req.body;

    if (!address || !googlePlaceId || latitude == null || longitude == null) {
      return res.status(400).json({ message: "All location fields are required" });
    }
    if (/^\d+$/.test(address?.trim())) {
      return res.status(400).json({ message: "address cannot be only numbers" });
    }
    //const trimmedaddress=address?.trim();
  // // Validation: name should not be too long
  // if (trimmedaddress.length > 50) {
  //   return res.status(400).json({ message: "Company address cannot exceed 100 characters." });
  // }

    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    await company.update({
      address,
      googlePlaceId,
      latitude,
      longitude,
    });

    return res.status(200).json({
      message: "Company location updated successfully",
      location: {
        address: company.address,
        googlePlaceId: company.googlePlaceId,
        latitude: company.latitude,
        longitude: company.longitude,
      }
    });
  } catch (error) {
    console.error("updateCompanyLocation error:", error);
    res.status(500).json({ message: "Failed to update location", error: error.message });
  }};



  exports.createCompanyAlbum = async (req, res) => {
    try {
      const { title } = req.body;
      const files = req.files || [];
      const companyId = req.user.companyId;
  
      if (!title || typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ message: "Album title is required" });
      }
      
    const trimmedTitle = title.trim();

    // 2. Validate title is not only digits
    if (/^\d+$/.test(trimmedTitle)) {
      return res.status(400).json({ message: "Album title cannot be only numbers" });
    }
  // // Validation: name should not be too long
   if (trimmedTitle.length > 50) {
    return res.status(400).json({ message: "Company address cannot exceed 100 characters." });
   }

    // 3. Validate title is unique for this company (case-insensitive)
    const existing = await CompanyAlbum.findOne({
      where: {
        companyId,
        title: { [Op.iLike]: trimmedTitle } // PostgreSQL case-insensitive match
      }
    });

    if (existing) {
      return res.status(400).json({ message: "An album with this title already exists" });
    }
      const uploadedPhotoUrls = [];
  
      for (const file of files) {
        const uniqueName = `photo_${Date.now()}_${uuidv4()}`;
        const folder = "company_albums";
  
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder,
              public_id: uniqueName,
              overwrite: false,
            },
            (error, result) => {
              if (error) reject(new Error("Image upload failed"));
              else resolve(result.secure_url);
            }
          ).end(file.buffer);
        });
  
        uploadedPhotoUrls.push(result);
      }
  
      const album = await CompanyAlbum.create({ companyId,title: title.trim() });
  
      if (uploadedPhotoUrls.length > 0) {
        const photoRecords = uploadedPhotoUrls.map((url) => ({
          albumId: album.albumId,
          photoUrl: url,
        }));
        await CompanyAlbumPhoto.bulkCreate(photoRecords);
      }
  
      const fullAlbum = await CompanyAlbum.findByPk(album.albumId, {
        include: {
          model: CompanyAlbumPhoto,
          as: "photos",
          attributes: ["photoId", "photoUrl"],
        },
      });
  
      return res.status(201).json({
        message: "Album created successfully",
        album: fullAlbum,
      });
    } catch (error) {
      console.error("Album Upload Error:", error);
      return res.status(500).json({
        message: "Server error while creating album",
        error: error.message,
      });
    }
  };

exports.getMyCompanyAlbums = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(403).json({ message: "Unauthorized: Company ID not found in token" });
    }


    const albums = await CompanyAlbum.findAll({
      where: { companyId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: CompanyAlbumPhoto,
          as: "photos",
          attributes: ["photoId", "photoUrl"],
        },
      ],
    });

    const albumsWithPhotoCount = albums.map(album => ({
      ...album.toJSON(),
      photoCount: album.photos.length,
    }));
    return res.status(200).json({ albumsWithPhotoCount });
  } catch (error) {
    console.error("Error fetching company albums:", error);
    return res.status(500).json({
      message: "Server error while retrieving albums",
      error: error.message,
    });
  }
};
exports.getAlbumsByCompanyId = async (req, res) => {
  try {
    const companyId = parseInt(req.query.companyId);

    if (!companyId || isNaN(companyId)) {
      return res.status(400).json({ message: "Invalid or missing companyId" });
    }

    const albums = await CompanyAlbum.findAll({
      where: { companyId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: CompanyAlbumPhoto,
          as: "photos",
          attributes: ["photoId", "photoUrl"],
        },
      ],
    });

    const albumsWithPhotoCount = albums.map(album => ({
      ...album.toJSON(),
      photoCount: album.photos.length,
    }));

    return res.status(200).json({ albums: albumsWithPhotoCount });
  } catch (error) {
    console.error("Error fetching company albums:", error);
    return res.status(500).json({
      message: "Server error while retrieving albums",
      error: error.message,
    });
  }
};


exports.getPhotosByAlbumId = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { albumId } = req.query;

    if (!companyId) {
      return res.status(403).json({ message: "Unauthorized: Company ID not found" });
    }

    // 🔐 Find album and verify ownership
    const album = await CompanyAlbum.findOne({
      where: { albumId, companyId },
      include: {
        model: CompanyAlbumPhoto,
        as: "photos",
        attributes: ["photoId", "photoUrl"],
      },
    });

    if (!album) {
      return res.status(404).json({ message: "Album not found or does not belong to your company" });
    }

    return res.status(200).json({
      albumId: album.albumId,
      title: album.title,
      photos: album.photos,
    });
  } catch (error) {
    console.error("Error fetching album photos:", error);
    return res.status(500).json({
      message: "Server error while retrieving album photos",
      error: error.message,
    });
  }
};
exports.deletePhotoFromAlbum = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const { albumId, photoId } = req.query;

    if (!companyId) {
      return res.status(403).json({ message: "Unauthorized: Company ID not found in token" });
    }

    if (!albumId || !photoId) {
      return res.status(400).json({ message: "Album ID and Photo ID are required" });
    }

    // ✅ Check album belongs to company
    const album = await CompanyAlbum.findOne({
      where: { albumId, companyId },
    });

    if (!album) {
      return res.status(404).json({ message: "Album not found or unauthorized" });
    }


    // ✅ Find photo
    const photo = await CompanyAlbumPhoto.findOne({
      where: { photoId, albumId },
    });

    if (!photo) {
      return res.status(404).json({ message: "Photo not found in this album" });
    }

    // ✅ Extract public ID and delete from Cloudinary
    const folder = "company_albums";
    const publicId = extractPublicId(photo.photoUrl, folder);

    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      } catch (cloudErr) {
        console.warn("Cloudinary deletion failed:", cloudErr.message);
      }
    }

    // ✅ Delete from DB
    await photo.destroy();

    return res.status(200).json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return res.status(500).json({
      message: "Server error while deleting photo",
      error: error.message,
    });
  }
};

exports.deleteCompanyAlbum = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const { albumId } = req.query;

    if (!companyId) {
      return res.status(403).json({ message: "Unauthorized: Company ID not found in token" });
    }

    // ✅ Check ownership
    const album = await CompanyAlbum.findOne({
      where: { albumId, companyId },
      include: {
        model: CompanyAlbumPhoto,
        as: "photos",
        attributes: ["photoId", "photoUrl"],
      },
    });

    if (!album) {
      return res.status(404).json({ message: "Album not found or does not belong to your company" });
    }

    const folder = "company_albums";

    for (const photo of album.photos) {
      const publicId = extractPublicId(photo.photoUrl, folder);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        } catch (err) {
          console.warn(`Failed to delete Cloudinary image for photoId ${photo.photoId}:`, err.message);
        }
      }
    }

    await CompanyAlbumPhoto.destroy({ where: { albumId } });
    await album.destroy();

    return res.status(200).json({ message: "Album and photos deleted successfully" });
  } catch (error) {
    console.error("Delete Album Error:", error);
    return res.status(500).json({ message: "Failed to delete album", error: error.message });
  }
};
exports.addPhotosToAlbum = async (req, res) => {
  try {
    const { albumId } = req.query;
    const companyId = req.user?.companyId;
    const files = req.files || [];

    if (!companyId) {
      return res.status(403).json({ message: "Unauthorized: Company ID missing from token" });
    }

    if (!albumId || files.length === 0) {
      return res.status(400).json({ message: "Album ID and at least one photo are required" });
    }

    // ✅ Verify the album belongs to the company
    const album = await CompanyAlbum.findOne({
      where: { albumId, companyId },
    });

    if (!album) {
      return res.status(404).json({ message: "Album not found or unauthorized" });
    }

    const uploadedPhotos = [];

    for (const file of files) {
      const uniqueName = `photo_${Date.now()}_${uuidv4()}`;
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: "company_albums",
            public_id: uniqueName,
            overwrite: false,
          },
          (error, result) => {
            if (error) reject(new Error("Image upload failed"));
            else resolve(result.secure_url);
          }
        ).end(file.buffer);
      });

      uploadedPhotos.push({
        albumId: album.albumId,
        photoUrl: result,
      });
    }

    await CompanyAlbumPhoto.bulkCreate(uploadedPhotos);

    const updatedAlbum = await CompanyAlbum.findByPk(albumId, {
      include: {
        model: CompanyAlbumPhoto,
        as: "photos",
        attributes: ["photoId", "photoUrl"],
      },
    });

    return res.status(200).json({
      message: "Photos added successfully",
      album: updatedAlbum,
    });
  } catch (error) {
    console.error("Error adding photos to album:", error);
    return res.status(500).json({
      message: "Server error while adding photos",
      error: error.message,
    });
  }
};


exports.updateAlbumTitle = async (req, res) => {
  const { albumId } = req.query;
  const { title } = req.body;
  const requesterCompanyId = req.user?.companyId;

  if (!requesterCompanyId) {
    return res.status(403).json({ message: "Access denied. Company authentication required." });
  }

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ message: "Title is required and must be a non-empty string." });
  }

  try {
    const album = await CompanyAlbum.findByPk(albumId);

    if (!album) {
      return res.status(404).json({ message: "Album not found." });
    }
    const trimmedTitle=title.trim();
    if (trimmedTitle.length > 50) {
      return res.status(400).json({ message: "Company address cannot exceed 100 characters." });
     }

    if (album.companyId !== requesterCompanyId) {
      return res.status(403).json({ message: "You are not authorized to edit this album." });
    }

    album.title = trimmedTitle;
    await album.save();

    res.status(200).json({ message: "Album title updated successfully.", album });
  } catch (error) {
    console.error("Error updating album title:", error);
    res.status(500).json({ message: "Server error while updating album title." });
  }
};
