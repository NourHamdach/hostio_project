const express = require("express");
const router = express.Router();
const MinimumSeniority = require("../models/jobRelations/MinimumSeniority");

router.get("/", async (req, res) => {
  try {
    const seniorities = await MinimumSeniority.findAll({
      attributes: ["seniorityId", "seniorityLevel"],
      order: [["seniorityId", "ASC"]],
    });
    res.json(seniorities);
  } catch (error) {
    console.error("Failed to fetch minimum seniority levels:", error);
    res.status(500).json({ message: "Server error while fetching seniority levels" });
  }
});

module.exports = router;
