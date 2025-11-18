const express = require("express");
const router = express.Router();
const ContractDuration = require("../models/jobRelations/DurationOfContract");

router.get("/", async (req, res) => {
  try {
    const durations = await ContractDuration.findAll({
      attributes: ["durationId", "durationType"],
      order: [["durationId", "ASC"]],
    });
    res.json(durations);
  } catch (error) {
    console.error("Failed to fetch contract durations:", error);
    res.status(500).json({ message: "Server error while fetching durations" });
  }
});

module.exports = router;
