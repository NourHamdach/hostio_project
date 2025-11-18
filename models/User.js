"use strict";
const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../config/database/database");

class User extends Model {}

User.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isNotNullWhenOTP(value) {
          if (this.authMethod === "otp" && !value) {
            throw new Error("Password is required for OTP authentication.");
          }
        },
      },
    },
    role: {
      type: DataTypes.ENUM("jobseeker", "company"),
      allowNull: false,
    },
    otp_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otp_expiration: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    authMethod: {
      type: DataTypes.ENUM("google", "otp"),
      allowNull: false,
    },
    googleId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    countryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Countries",
        key: "countryId",
      },
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Cities",
        key: "cityId",
      },
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "Users", // ✅ Add this line to force plural table name
    timestamps: true,
  }
);

module.exports = User;

