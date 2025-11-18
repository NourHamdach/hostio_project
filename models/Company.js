const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../config/database/database");
// const User = require("./User");
// const Type = require("./CompanyRelations/CompanyType/Types");
// const CompanySize = require("./CompanyRelations/CompanySize/CompanySize");

class Company extends Model {}

Company.init(
  {
    companyId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "Users",
        key: "userId",
      },
      onDelete: "CASCADE",
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sizeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "CompanySizes",
        key: "sizeId",
      },
      onDelete: "SET NULL",
    },    
    foundedYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    companyDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    typeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Types",
        key: "typeId",
      },
      onDelete: "SET NULL",
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // ✅ PREMIUM PLAN FIELDS
    hasPremiumPlan: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    premiumSince: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    premiumExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    jobLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    backgroundImageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mediaUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mediaType: {
      type: DataTypes.ENUM('image', 'video'),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    googlePlaceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    
    
  },
  {
    sequelize,
    modelName: "Company",
    tableName: "Companies", // ✅ Add this line
    timestamps: true,
  }
);

// // Define associations
// User.hasOne(Company, { foreignKey: "userId" });
// Company.belongsTo(User, { foreignKey: "userId" });

// Company.belongsTo(Type, { foreignKey: "typeId", as: "type" });
// Type.hasMany(Company, { foreignKey: "typeId", as: "companies" });


// Company.belongsTo(CompanySize, { foreignKey: "sizeId", as: "companySize" });
// CompanySize.hasMany(Company, { foreignKey: "sizeId", as: "companies" });


module.exports = Company;
