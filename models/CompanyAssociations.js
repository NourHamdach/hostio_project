// // Model Imports
// const User = require("./User");
// const Company = require("./Company");
// const PostComment = require("./postRelations/PostComment");

// const Country = require("./CompanyRelations/CompanyLocations/Country");
// const City = require("./CompanyRelations/CompanyLocations/City");
// const CompanyLocations = require("./CompanyRelations/CompanyLocations/CompanyLocations");

// const CompanyKeyFact = require("./CompanyRelations/companykeyfact");
// const CompanyAlbum = require("./CompanyRelations/CompanyAlbum");
// const CompanyAlbumPhoto = require("./CompanyRelations/CompanyAlbumPhoto");
// const StripeHistory = require("./CompanyRelations/StripeHistory");

// const Type = require("./CompanyRelations/CompanyType"); // assumed path
// const CompanySize = require("./CompanyRelations/CompanySize"); // assumed path

// // ===========================
// // User ↔️ Country / City
// // ===========================
// User.belongsTo(Country, { foreignKey: "countryId", as: "country" });
// User.belongsTo(City, { foreignKey: "cityId", as: "city" });

// Country.hasMany(User, { foreignKey: "countryId", as: "users" });
// City.hasMany(User, { foreignKey: "cityId", as: "users" });

// // ===========================
// // City ↔️ Country
// // ===========================
// City.belongsTo(Country, { foreignKey: "countryId", as: "country" });
// Country.hasMany(City, { foreignKey: "countryId", as: "cities" });

// // ===========================
// // User ↔️ Company (One-to-One)
// // ===========================
// User.hasOne(Company, { foreignKey: "userId", as: "company" });
// Company.belongsTo(User, { foreignKey: "userId", as: "user" });

// // ===========================
// // Company ↔️ Locations
// // ===========================
// Company.hasMany(CompanyLocations, { foreignKey: "companyId", as: "locations" });
// CompanyLocations.belongsTo(Company, { foreignKey: "companyId", as: "company" });

// City.hasMany(CompanyLocations, { foreignKey: "cityId", as: "companyLocations" });
// CompanyLocations.belongsTo(City, { foreignKey: "cityId", as: "city" });

// // ===========================
// // Company ↔️ Key Facts
// // ===========================
// Company.hasMany(CompanyKeyFact, { foreignKey: "companyId", as: "keyFacts" });
// CompanyKeyFact.belongsTo(Company, { foreignKey: "companyId", as: "company" });

// // ===========================
// // Company ↔️ Album / Photos
// // ===========================
// Company.hasMany(CompanyAlbum, { foreignKey: "companyId", as: "albums" });
// CompanyAlbum.belongsTo(Company, { foreignKey: "companyId", as: "company" });

// CompanyAlbum.hasMany(CompanyAlbumPhoto, { foreignKey: "albumId", as: "photos" });
// CompanyAlbumPhoto.belongsTo(CompanyAlbum, { foreignKey: "albumId", as: "album" });

// // ===========================
// // Company ↔️ StripeHistory
// // ===========================
// Company.hasMany(StripeHistory, { foreignKey: "companyId", as: "stripeHistory" });
// StripeHistory.belongsTo(Company, { foreignKey: "companyId", as: "company" });

// // ===========================
// // Company ↔️ Type / Size
// // ===========================
// Company.belongsTo(Type, { foreignKey: "typeId", as: "type" });
// Type.hasMany(Company, { foreignKey: "typeId", as: "companies" });

// Company.belongsTo(CompanySize, { foreignKey: "sizeId", as: "companySize" });
// CompanySize.hasMany(Company, { foreignKey: "sizeId", as: "companies" });

// // ===========================
// // Export All Models
// // ===========================
// module.exports = {
//   User,
//   Company,
//   PostComment,
//   Country,
//   City,
//   CompanyLocations,
//   CompanyKeyFact,
//   CompanyAlbum,
//   CompanyAlbumPhoto,
//   StripeHistory,
//   Type,
//   CompanySize,
// };
