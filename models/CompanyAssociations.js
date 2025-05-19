const User = require("./User");
const Company = require("./Company");
const PostComment = require("./postRelations/PostComment");
const Country = require("./CompanyRelations/CompanyLocations/Country");
const City = require("./CompanyRelations/CompanyLocations/City");
const CompanyLocations = require("./CompanyRelations/CompanyLocations/CompanyLocations");
const CompanyKeyFact = require('./CompanyRelations/companykeyfact');
const CompanyAlbum = require("./CompanyRelations/CompanyAlbum");
const CompanyAlbumPhoto = require("./CompanyRelations/CompanyAlbumPhoto");
const StripeHistory=require("./CompanyRelations/StripeHistory")
User.belongsTo(Country, { foreignKey: "countryId", as: "country" });
User.belongsTo(City, { foreignKey: "cityId", as: "city" });
Country.hasMany(User, { foreignKey: "countryId", as: "users" });
City.hasMany(User, { foreignKey: "cityId", as: "users" });

Company.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(Company, { foreignKey: "userId", as: "company" });

Company.hasMany(CompanyLocations, { foreignKey: "companyId", as: "locations" });
CompanyLocations.belongsTo(Company, { foreignKey: "companyId", as: "company" });

City.hasMany(CompanyLocations, { foreignKey: "cityId", as: "companyLocations" });
CompanyLocations.belongsTo(City, { foreignKey: "cityId", as: "city" });

City.belongsTo(Country, { foreignKey: "countryId", as: "country" });
Country.hasMany(City, { foreignKey: "countryId", as: "cities" });
// 🔗 One-to-Many: Company has many KeyFacts
Company.hasMany(CompanyKeyFact, {
  foreignKey: 'companyId',
  as: 'keyFacts',
});
CompanyKeyFact.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
});


Company.hasMany(CompanyAlbum, { foreignKey: "companyId", as: "albums" });
CompanyAlbum.belongsTo(Company, { foreignKey: "companyId", as: "company" });

CompanyAlbum.hasMany(CompanyAlbumPhoto, { foreignKey: "albumId", as: "photos" });
CompanyAlbumPhoto.belongsTo(CompanyAlbum, { foreignKey: "albumId", as: "album" });
Company.hasMany(StripeHistory, { foreignKey: "companyId", as: "stripeHistory" });
StripeHistory.belongsTo(Company, { foreignKey: "companyId", as: "company" });

module.exports = {
  User,
  Company,
  PostComment,
  Country,
  City,
  CompanyLocations,
  CompanyKeyFact,
  CompanyAlbum,
  CompanyAlbumPhoto,
  StripeHistory,
};