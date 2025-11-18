const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../config/database/database");

class StripeHistory extends Model {}

StripeHistory.init(
  {
    historyId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Companies",
        key: "companyId"
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "usd"
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: "StripeHistory",
    tableName: "StripeHistories",
    timestamps: true
  }
);

module.exports = StripeHistory;
