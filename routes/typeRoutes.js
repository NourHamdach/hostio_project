const express = require("express");
const router = express.Router();
const Type = require("../models/CompanyRelations/CompanyType/Types"); 

router.get("/", async (req, res) => {
  try {
    const types = await Type.findAll({
      attributes: ["typeId", "typeName"],
      order: [["typeName", "ASC"]],
    });
    res.json(types);
  } catch (error) {
    console.error("Failed to fetch types:", error);
    res.status(500).json({ message: "Server error while fetching types" });
  }
});

module.exports = router;
