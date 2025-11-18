const express = require("express");
const router = express.Router();
const CompanySize = require("../models/CompanyRelations/CompanySize/CompanySize"); // ✅ Adjust the path as needed

// GET /api/company-sizes
router.get("/", async (req, res) => {
  try {
    const sizes = await CompanySize.findAll({
      attributes: ["sizeId", "sizeName"],
      order: [["sizeId", "ASC"]],
    });
    res.status(200).json(sizes);
  } catch (error) {
    console.error("❌ Failed to fetch company sizes:", error);
    res.status(500).json({ message: "Server error while fetching company sizes" });
  }
});

module.exports = router;
