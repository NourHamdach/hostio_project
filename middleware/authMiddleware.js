const jwt = require("jsonwebtoken");
const User=require("../models/User")
const Company=require("../models/Company")
const JobSeeker=require("../models/Jobseeker")
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;

    // ✅ Ensure the user exists
    const user = await User.findOne({ where: { userId: decoded.userId } });
    if (!user) {
      return res.status(401).json({ message: "Invalid token or user not found." });
    }

    // ✅ Add companyId or jobSeekerId based on role
    if (decoded.role === "company") {
      let company = await Company.findOne({ where: { userId: user.userId } });
      if (!company) {
        return res.status(403).json({ message: "Unauthorized: Company profile not found." });
      }
      req.user.companyId = company.companyId; // ✅ Set companyId
    }

    if (decoded.role === "jobseeker") {
      let jobseeker = await JobSeeker.findOne({ where: { userId: user.userId } });
      if (!jobseeker) {
        return res.status(403).json({ message: "Unauthorized: jobseeker profile not found." });
      }
      req.user.jobSeekerId = decoded.jobSeekerId;
    }

    next(); // ✅ Pass to the next middleware
  } catch (error) {
    console.error("JWT Error:", error);
    return res.status(400).json({ message: "Invalid token" });
  }
};


exports.AdminverifyToken = async(req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token is invalid" });
  }
};
