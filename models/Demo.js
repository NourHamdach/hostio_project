// ✅ models/Demo.js
const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../config/database/database");
const StatusDemo = require("./demoRelations/StatusDemo");
const RecruitmentNeeds = require("./demoRelations/RecruitmentNeeds");
const Company = require("./Company");

class Demo extends Model {}

Demo.init(
  {
    demoId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    meetingDate: { type: DataTypes.DATEONLY, allowNull: false },
    meetingTime: { type: DataTypes.STRING, allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phoneCode: { type: DataTypes.STRING, allowNull: false },
    phoneNumber: { type: DataTypes.STRING, allowNull: false },
    recruitmentNeedsId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "RecruitmentNeeds", key: "recruitmentNeedsId" },
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "StatusDemos", key: "statusId" },
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Companies", key: "companyId" },
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
    calendarEventId: { type: DataTypes.STRING, allowNull: false },
    calendarMeetingLink: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, modelName: "Demo",
    tableName: "Demos",
     timestamps: true }
);


module.exports = Demo;
