const { DataTypes } = require("sequelize");

// Guard to prevent multiple association definitions
let associationsInitialized = false;

/**
 * Define all model associations in one centralized location.
 * This should be imported AFTER all models have been defined.
 */
function defineAssociations() {
  // Prevent duplicate association definitions
  if (associationsInitialized) {
    console.log("🔗 Associations already initialized, skipping...");
    return;
  }

  console.log("🔗 Setting up model associations...");

  try {
   // ===========================
// Import All Models
// ===========================
const User = require("../../models/User");
const Company = require("../../models/Company");
const Post = require("../../models/Post");
const PostLike = require("../../models/postRelations/PostLike");
const PostComment = require("../../models/postRelations/PostComment");

const Country = require("../../models/CompanyRelations/CompanyLocations/Country");
const City = require("../../models/CompanyRelations/CompanyLocations/City");
const CompanyLocations = require("../../models/CompanyRelations/CompanyLocations/CompanyLocations");
const CompanyKeyFact = require("../../models/CompanyRelations/companykeyfact");
const CompanyAlbum = require("../../models/CompanyRelations/CompanyAlbum");
const CompanyAlbumPhoto = require("../../models/CompanyRelations/CompanyAlbumPhoto");
const StripeHistory = require("../../models/CompanyRelations/StripeHistory");
const Type = require("../../models/CompanyRelations/CompanyType/Types");
const CompanySize = require("../../models/CompanyRelations/CompanySize/CompanySize");

const Job = require("../../models/Job");
const JobLanguage = require("../../models/jobRelations/JobLanguage");
const Language = require("../../models/Languages");
const ContractType = require("../../models/jobRelations/ContractType");
const Department = require("../../models/CompanyRelations/Department");
const JobDepartment = require("../../models/jobRelations/JobDepartment");
const JobRecruiterContact = require("../../models/jobRelations/JobRecruiterContact");
const StatusJob = require("../../models/jobRelations/StatusJob");
const JobExternalLink = require("../../models/jobRelations/JobExternalLink");
const RejectedJob = require("../../models/jobRelations/RejectedJob");
const MinimumSeniority = require("../../models/jobRelations/MinimumSeniority");
const ContractDuration = require("../../models/jobRelations/DurationOfContract");
const JobApplication = require("../../models/jobRelations/JobApplication");

const JobSeeker = require("../../models/Jobseeker");
const JobSeekerSkills = require("../../models/JobseekerRelations/Skills/JobseekerSkills");
const Skills = require("../../models/JobseekerRelations/Skills/Skills");
const JobseekerExperience = require("../../models/JobseekerRelations/JobseekerExperience");
const JobseekerEducation = require("../../models/JobseekerRelations/Educations/JobseekerEducations");

const JobPreference = require("../../models/JobseekerRelations/JobPreferences/JobPreferences");
const ContractDurationPreference = require("../../models/JobseekerRelations/JobPreferences/ContractDurationPreference");
const JobPreferenceContractTypes = require("../../models/JobseekerRelations/JobPreferences/JobPreferenceContractType");
const JobPreferenceContractDurations = require("../../models/JobseekerRelations/JobPreferences/JobPreferenceContractDuration");
const JobPreferenceDepartments = require("../../models/JobseekerRelations/JobPreferences/JobPreferenceDepartment");
const JobPreferenceLocations = require("../../models/JobseekerRelations/JobPreferences/JobPreferenceLocation");

const JobSeekerLanguages = require("../../models/JobseekerRelations/JobSeekerLanguage");
const Nationality = require("../../models/JobseekerRelations/Nationality");
const JobSeekerNationalities = require("../../models/JobseekerRelations/JobSeekerNationality");
const JobSeekerWorkPermit = require("../../models/JobseekerRelations/JobSeekerWorkPermit");
const SavedJob = require("../../models/JobseekerRelations/SavedJob");
const Languages=require("../../models/Languages")
const Demo = require("../../models/Demo");
const StatusDemo = require("../../models/demoRelations/StatusDemo");
const RecruitmentNeeds = require("../../models/demoRelations/RecruitmentNeeds");
Demo.belongsTo(StatusDemo, { foreignKey: "statusId" });
Demo.belongsTo(RecruitmentNeeds, { foreignKey: "recruitmentNeedsId" });
// Associations
Company.hasMany(Demo, { foreignKey: "companyId" });
Demo.belongsTo(Company, { foreignKey: "companyId" });
// ===========================
// Centralized Associations
// ===========================

// Avoid duplicate alias assignments across all models

// 🤝 User ↔️ Country/City
User.belongsTo(Country, { foreignKey: "countryId", as: "country" });
User.belongsTo(City, { foreignKey: "cityId", as: "city" });
Country.hasMany(User, { foreignKey: "countryId", as: "users" });
City.hasMany(User, { foreignKey: "cityId", as: "users" });

// 🏢 City ↔️ Country
City.belongsTo(Country, { foreignKey: "countryId", as: "country" });
Country.hasMany(City, { foreignKey: "countryId", as: "cities" });

// 👤 User ↔️ Company (1-1)
User.hasOne(Company, { foreignKey: "userId", as: "company" });
Company.belongsTo(User, { foreignKey: "userId", as: "user" });

// 📍 Company ↔️ Locations
Company.hasMany(CompanyLocations, { foreignKey: "companyId", as: "locations" });
CompanyLocations.belongsTo(Company, { foreignKey: "companyId", as: "company" });
City.hasMany(CompanyLocations, { foreignKey: "cityId", as: "companyLocations" });
CompanyLocations.belongsTo(City, { foreignKey: "cityId", as: "city" });

// 🔑 Key Facts
Company.hasMany(CompanyKeyFact, { foreignKey: "companyId", as: "keyFacts" });
CompanyKeyFact.belongsTo(Company, { foreignKey: "companyId", as: "company" });

// 📷 Albums
Company.hasMany(CompanyAlbum, { foreignKey: "companyId", as: "albums" });
CompanyAlbum.belongsTo(Company, { foreignKey: "companyId", as: "company" });
CompanyAlbum.hasMany(CompanyAlbumPhoto, { foreignKey: "albumId", as: "photos" });
CompanyAlbumPhoto.belongsTo(CompanyAlbum, { foreignKey: "albumId", as: "album" });

// 💳 Stripe
Company.hasMany(StripeHistory, { foreignKey: "companyId", as: "stripeHistory" });
StripeHistory.belongsTo(Company, { foreignKey: "companyId", as: "company" });

// 🏢 Type / Size
Company.belongsTo(Type, { foreignKey: "typeId", as: "type" });
Type.hasMany(Company, { foreignKey: "typeId", as: "companies" });
Company.belongsTo(CompanySize, { foreignKey: "sizeId", as: "companySize" });
CompanySize.hasMany(Company, { foreignKey: "sizeId", as: "companies" });

// 📄 Job ↔️ Related
Job.belongsTo(MinimumSeniority, { foreignKey: "minimumSeniorityId", as: "minimumSeniority" });
MinimumSeniority.hasMany(Job, { foreignKey: "minimumSeniorityId", as: "jobs" });
Job.belongsTo(ContractDuration, { foreignKey: "durationId", as: "contractDuration" });
ContractDuration.hasMany(Job, { foreignKey: "durationId", as: "jobs" });
Job.hasOne(JobRecruiterContact, { foreignKey: "jobId", as: "jobRecruiterContact" });
JobRecruiterContact.belongsTo(Job, { foreignKey: "jobId", as: "job" });

Job.belongsToMany(Department, { through: JobDepartment, foreignKey: "jobId", otherKey: "departmentId", as: "departments" });
Department.belongsToMany(Job, { through: JobDepartment, foreignKey: "departmentId", otherKey: "jobId", as: "jobs" });

Job.belongsToMany(Language, { through: JobLanguage, foreignKey: "jobId", otherKey: "languageId", as: "languages" });
Language.belongsToMany(Job, { through: JobLanguage, foreignKey: "languageId", otherKey: "jobId", as: "jobs" });

Job.belongsTo(Company, { foreignKey: "companyId", as: "company" });
Company.hasMany(Job, { foreignKey: "companyId", as: "jobs" });

Job.belongsTo(ContractType, { foreignKey: "contractId", as: "contractType" });
ContractType.hasMany(Job, { foreignKey: "contractId", as: "jobs" });

Job.belongsTo(StatusJob, { foreignKey: "statusId", as: "statusJob" });
StatusJob.hasMany(Job, { foreignKey: "statusId", as: "jobs" });

Job.hasOne(JobExternalLink, { foreignKey: "jobId", as: "externalLink" });
Job.hasOne(RejectedJob, { foreignKey: "jobId", as: "rejection" });
RejectedJob.belongsTo(Job, { foreignKey: "jobId", as: "job", onDelete: 'CASCADE' });

// 📨 Job Applications
Job.hasMany(JobApplication, { foreignKey: "jobId", as: "applications" });
JobApplication.belongsTo(Job, { foreignKey: "jobId", as: "job" });
JobApplication.belongsTo(JobSeeker, { foreignKey: "jobseekerId", as: "jobseeker" });
JobSeeker.hasMany(JobApplication, { foreignKey: "jobseekerId", as: "applications" });

// ✨ Skills
JobSeeker.hasMany(JobSeekerSkills, { foreignKey: "jobSeekerId", as: "skills" });
JobSeekerSkills.belongsTo(JobSeeker, { foreignKey: "jobSeekerId" });

// 💼 Experience / Education
JobSeeker.hasMany(JobseekerExperience, { foreignKey: "jobseekerId", as: "experiences" });
JobseekerExperience.belongsTo(JobSeeker, { foreignKey: "jobseekerId" });
JobseekerExperience.belongsTo(City, { foreignKey: "cityId", as: "city" });
JobseekerExperience.belongsTo(Country, { foreignKey: "countryId", as: "country" });
JobseekerExperience.belongsTo(Department, { foreignKey: "departmentId", as: "department" });

JobSeeker.hasMany(JobseekerEducation, { foreignKey: "jobseekerId", as: "educations" });
JobseekerEducation.belongsTo(JobSeeker, { foreignKey: "jobseekerId" });
JobseekerEducation.belongsTo(City, { foreignKey: "cityId", as: "city" });
JobseekerEducation.belongsTo(Country, { foreignKey: "countryId", as: "country" });

// 🧍‍♂️ User ↔️ JobSeeker
JobSeeker.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(JobSeeker, { foreignKey: "userId", as: "jobseeker" });

// 📌 Preferences
JobSeeker.hasOne(JobPreference, { foreignKey: "jobSeekerId", as: "preferences" });
JobPreference.belongsTo(JobSeeker, { foreignKey: "jobSeekerId" });

JobPreference.belongsToMany(ContractType, { through: JobPreferenceContractTypes, foreignKey: "jobPreferenceId", otherKey: "contractTypeId", as: "contractTypes" });
JobPreference.belongsToMany(ContractDurationPreference, { through: JobPreferenceContractDurations, foreignKey: "jobPreferenceId", otherKey: "durationId", as: "durations" });
JobPreference.belongsToMany(Department, { through: JobPreferenceDepartments, foreignKey: "jobPreferenceId", otherKey: "departmentId", as: "departments" });

JobPreference.hasMany(JobPreferenceLocations, { foreignKey: "jobPreferenceId", as: "locations" });
JobPreferenceLocations.belongsTo(JobPreference, { foreignKey: "jobPreferenceId" });
JobPreferenceLocations.belongsTo(City, { foreignKey: "cityId", as: "city" });
JobPreferenceLocations.belongsTo(Country, { foreignKey: "countryId", as: "country" });

// 🗣️ Languages
JobSeeker.belongsToMany(Languages, { through: JobSeekerLanguages, foreignKey: "jobSeekerId", otherKey: "languageId", as: "languages" });
Languages.belongsToMany(JobSeeker, { through: JobSeekerLanguages, foreignKey: "languageId", otherKey: "jobSeekerId", as: "jobSeekers" });
JobSeekerLanguages.belongsTo(Languages, { foreignKey: "languageId", as: "language" });

// 🛂 Nationalities & Permits
JobSeeker.belongsToMany(Nationality, { through: JobSeekerNationalities, foreignKey: "jobSeekerId", otherKey: "nationalityId", as: "nationalities" });
Nationality.belongsToMany(JobSeeker, { through: JobSeekerNationalities, foreignKey: "nationalityId", otherKey: "jobSeekerId" });
JobSeeker.hasMany(JobSeekerWorkPermit, { foreignKey: 'jobSeekerId', as: 'workPermits' });
JobSeekerWorkPermit.belongsTo(JobSeeker, { foreignKey: 'jobSeekerId' });
Country.hasMany(JobSeekerWorkPermit, { foreignKey: 'countryId', as: 'countryWorkPermits' });
JobSeekerWorkPermit.belongsTo(Country, { foreignKey: 'countryId', as: 'country' });

// 💾 Saved Jobs
JobSeeker.belongsToMany(Job, { through: SavedJob, foreignKey: "jobSeekerId", otherKey: "jobId", as: "savedJobs" });
Job.belongsToMany(JobSeeker, { through: SavedJob, foreignKey: "jobId", otherKey: "jobSeekerId", as: "savedByJobSeekers" });
SavedJob.belongsTo(Job, { foreignKey: "jobId", as: "job" });

    // Mark associations as initialized
    associationsInitialized = true;
    console.log("✅ All associations defined successfully!");

  } catch (error) {
    console.error("❌ Error defining associations:", error);
    throw error;
  }
}

module.exports = {
  defineAssociations,
};