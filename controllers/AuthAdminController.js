// ✅ Admin auth controller with registration, login, and JWT generation
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const User = require("../models/User")
const jwt = require("jsonwebtoken");
const { Company } = require('../models');
const {sequelize} = require("../config/database/database"); // ✅ needed for sequelize.fn(), .col(), .literal()

const Job = require("../models/Job"); // or adjust based on your actual file
const StatusJob = require("../models/jobRelations/StatusJob"); // adjust name if needed

const Country = require("../models/CompanyRelations/CompanyLocations/Country");


const JobSeeker  = require("../models/Jobseeker");


const JobApplication = require("../models/jobRelations/JobApplication"); // ✅ adjust path as needed
exports.getTopCountriesByApplications = async (req, res) => {
  try {
    const results = await JobApplication.findAll({
      include: {
        model: JobSeeker,
        as: "jobseeker",
        attributes: [],
        include: {
          model: User,
          as: "user",
          attributes: [],
          include: {
            model: Country,
            as: "country",
            attributes: []
          }
        }
      },
      attributes: [
        [sequelize.col("jobseeker.user.country.countryName"), "country"],
        [sequelize.fn("COUNT", sequelize.col("JobApplication.applicationId")), "applications"]
      ],
      group: [sequelize.col("jobseeker.user.country.countryName")], // ✅ only this
      order: [[sequelize.literal("applications"), "DESC"]],
      raw: true
    });

    const formatted = results
      .filter(r => r.country)
      .map(r => ({
        country: r.country,
        applications: parseInt(r.applications, 10)
      }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching top countries by applications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.getJobSeekerOpenToWorkStats = async (req, res) => {
  try {
    const openToWork = await JobSeeker.count({ where: { isLookingForJob: true } });
    const notOpenToWork = await JobSeeker.count({ where: { isLookingForJob: false } });

    return res.status(200).json({
      openToWork,
      notOpenToWork,
    });
  } catch (error) {
    console.error("Error getting job seeker open-to-work stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


exports.getUserCountByCountry = async (req, res) => {
  try {
    const usersByCountry = await User.findAll({
      attributes: [
        "countryId",
        [sequelize.fn("COUNT", sequelize.col("userId")), "userCount"]
      ],
      include: [
        {
          model: Country,
          as: "country",
          attributes: ["countryName"]
        }
      ],
      group: ["User.countryId", "country.countryId"],
      raw: true,
      nest: true,
    });

    const filteredResults = usersByCountry
      .filter(entry => entry.country && entry.country.countryName) // exclude null names
      .map(entry => ({
        countryName: entry.country.countryName,
        count: parseInt(entry.userCount, 10) // convert to integer
      }));

    res.status(200).json(filteredResults);
  } catch (error) {
    console.error("Error fetching user count by country:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

exports.getJobsPerMonth = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      attributes: [
        [sequelize.fn("TO_CHAR", sequelize.col("createdAt"), "YYYY-MM"), "month"],
        [sequelize.fn("COUNT", sequelize.col("jobId")), "count"]
      ],
      group: [sequelize.fn("TO_CHAR", sequelize.col("createdAt"), "YYYY-MM")],
      order: [[sequelize.fn("TO_CHAR", sequelize.col("createdAt"), "YYYY-MM"), "ASC"]],
      raw: true
    });

    const formatted = jobs.map(j => ({
      month: j.month,
      count: parseInt(j.count)
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching jobs per month:", err);
    res.status(500).json({ error: "Failed to fetch job timeline stats" });
  }
};


exports.getUsersPerMonth = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        [sequelize.fn("TO_CHAR", sequelize.col("createdAt"), "YYYY-MM"), "month"],
        [sequelize.fn("COUNT", sequelize.col("userId")), "count"]
      ],
      group: [sequelize.fn("TO_CHAR", sequelize.col("createdAt"), "YYYY-MM")],
      order: [[sequelize.fn("TO_CHAR", sequelize.col("createdAt"), "YYYY-MM"), "ASC"]],
      raw: true
    });

    const formatted = users.map(entry => ({
      month: entry.month,
      count: parseInt(entry.count)
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching users per month:", error);
    res.status(500).json({ error: "Failed to fetch user timeline stats" });
  }
};
exports.getJobsByStatus = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      attributes: [
        ['statusId', 'statusId'], // 👈 still selecting from Job table
        [sequelize.fn('COUNT', sequelize.col('Job.jobId')), 'count']
      ],
      include: {
        model: StatusJob,
        as: 'statusJob',
        attributes: ['statusName']
      },
      group: ['Job.statusId', 'statusJob.statusId'], // 👈 Fully qualify here
      raw: true,
      nest: true
    });

    const formatted = jobs.map(j => ({
      status: j.statusJob.statusName,
      count: parseInt(j.count)
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching jobs by status:", err);
    res.status(500).json({ error: "Failed to fetch job status stats" });
  }
};

exports.getActiveCompanies = async (req, res) => {
  try {
    const results = await Company.findAll({
      attributes: [
        'companyId',
        'companyName',
        [sequelize.col('jobs->statusJob.statusName'), 'statusName'],
        [sequelize.fn('COUNT', sequelize.col('jobs.jobId')), 'jobCount'],
      ],
      include: [
        {
          model: Job,
          as: 'jobs',
          attributes: [],
          include: [
            {
              model: StatusJob,
              as: 'statusJob',
              attributes: [],
            }
          ]
        }
      ],
      group: ['Company.companyId', 'jobs.statusId', 'jobs->statusJob.statusName'],
      raw: true,
    });

    // 🔄 Reformat flat results into grouped format
    const companyMap = {};

    for (const row of results) {
      const { companyId, companyName, statusName, jobCount } = row;

      if (!companyMap[companyId]) {
        companyMap[companyId] = {
          companyId,
          companyName,
          totalJobCount: 0,
          jobStatusCounts: {}
        };
      }

      companyMap[companyId].jobStatusCounts[statusName] = parseInt(jobCount);
      companyMap[companyId].totalJobCount += parseInt(jobCount);
    }

    const formatted = Object.values(companyMap);
    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching active companies:", error);
    res.status(500).json({ error: "Failed to fetch active companies" });
  }
};


// 🔐 POST /api/admin/register
exports.registerAdmin = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    const existing = await Admin.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ email, fullName, password: hashedPassword });
    const token = jwt.sign(
      { id: admin.adminId, role: "admin", email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({ message: "Admin registered successfully",admin,token});
  } catch (err) {
    console.error("Admin registration error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔐 POST /api/admin/login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin.adminId, role: "admin", email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, admin: { id: admin.adminId, email: admin.email, fullName: admin.fullName } });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.getRegisteredUsersStats = async (req, res) => {
  try {
    const jobSeekers = await User.count({ where: { role: 'jobseeker' } });
    const companies = await User.count({ where: { role: 'company' } });
    res.status(200).json({ jobSeekers, companies });
  } catch (error) {
    console.error("Error fetching registered users stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getVerifiedCompaniesStats = async (req, res) => {
  const verified = await Company.count({ where: { verified: true } });
  const unverified = await Company.count({ where: { verified: false } });
  res.json({ verified, unverified });
};

exports.getPremiumVsNonPremium = async (req, res) => {
  const premium = await Company.count({ where: { hasPremiumPlan: true } });
  const nonPremium = await Company.count({ where: { hasPremiumPlan: false } });
  res.json({ premium, nonPremium });
};
