const express = require("express");
const sequelize = require("./config/database");
const app = require("./app");

require("./models/CompanyAssociations");
require("./models/JobseekerAssociations");
require("./models/jobAssociations");

require("dotenv").config();

const PORT = process.env.PORT || 3001;


sequelize.sync({ alter: true })
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("DB Connection Error:", err));
