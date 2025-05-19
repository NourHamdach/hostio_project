const Company = require("../models/Company");

const verifyCompanyPremium = async (req, res, next) => {
  try {
    const { companyId } = req.user; // assuming you're using token-based auth

    if (!companyId) return res.status(403).json({ message: "Only companies can access this endpoint." });

    const company = await Company.findByPk(companyId);
    if (!company || !company.hasPremiumPlan) {
      return res.status(403).json({ message: "Access denied. Premium plan required to view this information." });
    }

    next();
  } catch (error) {
    console.error("verifyCompanyPremium error:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};
const verifyPremiumOrAdmin = async (req, res, next) => {
    try {
      const { role, companyId, userId } = req.user; // assumes req.user is populated from verifyToken middleware
  
      if (role === "admin") {
        return next(); // ✅ Allow admins
      }
  
      if (role === "company") {
        const company = await Company.findByPk(companyId);
        if (company && company.hasPremiumPlan) {
          return next(); // ✅ Allow premium companies
        }
        return res.status(403).json({
          message: "Access denied. A premium plan is required.",
        });
      }
  
      return res.status(403).json({
        message: "Access denied. You must be an admin or a premium company.",
      });
  
    } catch (error) {
      console.error("verifyPremiumOrAdmin error:", error);
      return res.status(500).json({
        message: "Internal server error",
        details: error.message,
      });
    }
  };

module.exports = {verifyCompanyPremium,verifyPremiumOrAdmin}
