/**
 * Models Index - Updated to use centralized database configuration
 * This file exports the {sequelize} instance and all models from the centralized config
 */
const {sequelize} = require("../config/database/database");
const { defineAssociations } = require("../config/database/relations");

const User = require("./User");
const Company = require("./Company");
const Post = require("./Post");
const PostLike = require("./postRelations/PostLike");
const PostComment = require("./postRelations/PostComment");

const Country = require("./CompanyRelations/CompanyLocations/Country");
const City = require("./CompanyRelations/CompanyLocations/City");
const CompanyLocations = require("./CompanyRelations/CompanyLocations/CompanyLocations");
const CompanyKeyFact = require("./CompanyRelations/companykeyfact");
const CompanyAlbum = require("./CompanyRelations/CompanyAlbum");
const CompanyAlbumPhoto = require("./CompanyRelations/CompanyAlbumPhoto");
const StripeHistory = require("./CompanyRelations/StripeHistory");
const Type = require("./CompanyRelations/CompanyType/Types");
const CompanySize = require("./CompanyRelations/CompanySize/CompanySize");

const Job = require("./Job");
const JobLanguage = require("./jobRelations/JobLanguage");
const Language = require("./Languages");
const Languages = require("./Languages"); // alias for consistency
const ContractType = require("./jobRelations/ContractType");
const Department = require("./CompanyRelations/Department");
const JobDepartment = require("./jobRelations/JobDepartment");
const JobRecruiterContact = require("./jobRelations/JobRecruiterContact");
const StatusJob = require("./jobRelations/StatusJob");
const JobExternalLink = require("./jobRelations/JobExternalLink");
const RejectedJob = require("./jobRelations/RejectedJob");
const MinimumSeniority = require("./jobRelations/MinimumSeniority");
const ContractDuration = require("./jobRelations/DurationOfContract");
const JobApplication = require("./jobRelations/JobApplication");

const JobSeeker = require("./Jobseeker");
const JobSeekerSkills = require("./JobseekerRelations/Skills/JobseekerSkills");
const Skills = require("./JobseekerRelations/Skills/Skills");
const JobseekerExperience = require("./JobseekerRelations/JobseekerExperience");
const JobseekerEducation = require("./JobseekerRelations/Educations/JobseekerEducations");

const JobPreference = require("./JobseekerRelations/JobPreferences/JobPreferences");
const ContractDurationPreference = require("./JobseekerRelations/JobPreferences/ContractDurationPreference");
const JobPreferenceContractTypes = require("./JobseekerRelations/JobPreferences/JobPreferenceContractType");
const JobPreferenceContractDurations = require("./JobseekerRelations/JobPreferences/JobPreferenceContractDuration");
const JobPreferenceDepartments = require("./JobseekerRelations/JobPreferences/JobPreferenceDepartment");
const JobPreferenceLocations = require("./JobseekerRelations/JobPreferences/JobPreferenceLocation");

const JobSeekerLanguages = require("./JobseekerRelations/JobSeekerLanguage");
const Nationality = require("./JobseekerRelations/Nationality");
const JobSeekerNationalities = require("./JobseekerRelations/JobSeekerNationality");
const JobSeekerWorkPermit = require("./JobseekerRelations/JobSeekerWorkPermit");
const SavedJob = require("./JobseekerRelations/SavedJob");

module.exports = {
  User,
  Company,
  Post,
  PostLike,
  PostComment,

  Country,
  City,
  CompanyLocations,
  CompanyKeyFact,
  CompanyAlbum,
  CompanyAlbumPhoto,
  StripeHistory,
  Type,
  CompanySize,

  Job,
  JobLanguage,
  ContractType,
  Department,
  JobDepartment,
  JobRecruiterContact,
  StatusJob,
  Language,
  JobExternalLink,
  RejectedJob,
  MinimumSeniority,
  ContractDuration,
  JobApplication,

  JobSeeker,
  JobSeekerSkills,
  Skills,
  JobseekerExperience,
  JobseekerEducation,

  JobPreference,
  ContractDurationPreference,
  JobPreferenceContractTypes,
  JobPreferenceContractDurations,
  JobPreferenceDepartments,
  JobPreferenceLocations,

  JobSeekerLanguages,
  Languages, // exported again for consistency
  Nationality,
  JobSeekerNationalities,
  JobSeekerWorkPermit,
  SavedJob,
};
