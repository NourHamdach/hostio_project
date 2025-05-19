// ✅ models/DemoRelations/RecruitmentNeeds.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

class RecruitmentNeeds extends Model {}

RecruitmentNeeds.init(
  {
    recruitmentNeedsId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    description: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, modelName: "RecruitmentNeeds",
    timestamps: true, // 🚨 This disables createdAt/updatedAt
  }
);

module.exports = RecruitmentNeeds;
