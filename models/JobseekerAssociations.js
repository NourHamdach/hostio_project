// const JobSeeker = require("./Jobseeker");
// const JobSeekerSkills = require("./JobseekerRelations/Skills/JobseekerSkills");
// const Skills = require("./JobseekerRelations/Skills/Skills");
// const Company = require("./Company");
// const JobseekerExperience = require("./JobseekerRelations/JobseekerExperience");
// const JobseekerEducation = require("./JobseekerRelations/Educations/JobseekerEducations");
// const User = require("./User");
// const Country = require("./CompanyRelations/CompanyLocations/Country");
// const City = require("./CompanyRelations/CompanyLocations/City");

// const JobPreference = require("./JobseekerRelations/JobPreferences/JobPreferences");
// const ContractType = require("./jobRelations/ContractType");
// const Department = require("./CompanyRelations/Department");
// const ContractDurationPreference = require("./JobseekerRelations/JobPreferences/ContractDurationPreference");

// const JobPreferenceContractTypes = require("./JobseekerRelations/JobPreferences/JobPreferenceContractType");
// const JobPreferenceContractDurations = require("./JobseekerRelations/JobPreferences/JobPreferenceContractDuration");
// const JobPreferenceDepartments = require("./JobseekerRelations/JobPreferences/JobPreferenceDepartment");
// const JobPreferenceLocations = require("./JobseekerRelations/JobPreferences/JobPreferenceLocation");

// const Languages = require("./Languages");
// const JobSeekerLanguages = require("./JobseekerRelations/JobSeekerLanguage");
// const Job = require("./Job");

// const Nationality = require("./JobseekerRelations/Nationality");
// const JobSeekerNationalities = require("./JobseekerRelations/JobSeekerNationality");
// const JobSeekerWorkPermit = require('./JobseekerRelations/JobSeekerWorkPermit');
// const SavedJob = require("./JobseekerRelations/SavedJob");
// // ============================
// // Skills
// // JobSeeker.belongsToMany(Skills, {
// //   through: JobSeekerSkills,
// //   foreignKey: "jobSeekerId",
// //   otherKey: "skillsId",
// //   as: "skills",
// // });
// // Skills.belongsToMany(JobSeeker, {
// //   through: JobSeekerSkills,
// //   foreignKey: "skillsId",
// //   otherKey: "jobSeekerId",
// //   as: "jobSeekers",
// // });
// JobSeeker.hasMany(JobSeekerSkills, { foreignKey: "jobSeekerId", as: "skills" });
// JobSeekerSkills.belongsTo(JobSeeker, { foreignKey: "jobSeekerId" });


// // ============================
// // Professional Experience
// JobSeeker.hasMany(JobseekerExperience, {
//   foreignKey: "jobseekerId",
//   as: "experiences",
// });
// JobseekerExperience.belongsTo(JobSeeker, { foreignKey: "jobseekerId" });
// JobseekerExperience.belongsTo(City, { foreignKey: "cityId", as: "city" });
// JobseekerExperience.belongsTo(Country, { foreignKey: "countryId", as: "country" });
// JobseekerExperience.belongsTo(Department, { foreignKey: "departmentId", as: "department" });

// // ============================
// // Education
// JobSeeker.hasMany(JobseekerEducation, {
//   foreignKey: "jobseekerId",
//   as: "educations",
// });
// JobseekerEducation.belongsTo(JobSeeker, { foreignKey: "jobseekerId" });
// JobseekerEducation.belongsTo(City, { foreignKey: "cityId", as: "city" });
// JobseekerEducation.belongsTo(Country, { foreignKey: "countryId", as: "country" });

// // ============================
// // User
// JobSeeker.belongsTo(User, { foreignKey: "userId", as: "user" });
// User.hasOne(JobSeeker, { foreignKey: "userId", as: "jobseeker" });

// // ============================
// // Preferences (1-to-1)
// JobSeeker.hasOne(JobPreference, { foreignKey: "jobSeekerId", as: "preferences" });
// JobPreference.belongsTo(JobSeeker, { foreignKey: "jobSeekerId" });

// // ============================
// // Contract Types
// JobPreference.belongsToMany(ContractType, {
//   through: JobPreferenceContractTypes,
//   foreignKey: "jobPreferenceId",
//   otherKey: "contractTypeId",
//   as: "contractTypes",
// });
// ContractType.belongsToMany(JobPreference, {
//   through: JobPreferenceContractTypes,
//   foreignKey: "contractTypeId",
//   otherKey: "jobPreferenceId",
// });

// // ============================
// // Contract Durations
// JobPreference.belongsToMany(ContractDurationPreference, {
//   through: JobPreferenceContractDurations,
//   foreignKey: "jobPreferenceId",
//   otherKey: "durationId",
//   as: "durations",
// });
// ContractDurationPreference.belongsToMany(JobPreference, {
//   through: JobPreferenceContractDurations,
//   foreignKey: "durationId",
//   otherKey: "jobPreferenceId",
// });

// // ============================
// // Departments
// JobPreference.belongsToMany(Department, {
//   through: JobPreferenceDepartments,
//   foreignKey: "jobPreferenceId",
//   otherKey: "departmentId",
//   as: "departments",
// });
// Department.belongsToMany(JobPreference, {
//   through: JobPreferenceDepartments,
//   foreignKey: "departmentId",
//   otherKey: "jobPreferenceId",
// });

// // ============================
// // Locations (through table + eager load)
// JobPreference.hasMany(JobPreferenceLocations, {
//   foreignKey: "jobPreferenceId",
//   as: "locations", // ✅ This alias must match your include
// });
// JobPreferenceLocations.belongsTo(JobPreference, { foreignKey: "jobPreferenceId" });
// JobPreferenceLocations.belongsTo(City, { foreignKey: "cityId", as: "city" });
// JobPreferenceLocations.belongsTo(Country, { foreignKey: "countryId", as: "country" });

// // ============================
// // Languages
// JobSeeker.belongsToMany(Languages, {
//   through: JobSeekerLanguages,
//   foreignKey: "jobSeekerId",
//   otherKey: "languageId",
//   as: "languages",
// });
// Languages.belongsToMany(JobSeeker, {
//   through: JobSeekerLanguages,
//   foreignKey: "languageId",
//   otherKey: "jobSeekerId",
//   as: "jobSeekers",
// });
// JobSeekerLanguages.belongsTo(Languages, { foreignKey: "languageId", as: "language" });


// // ============================
// // Nationalities
// JobSeeker.belongsToMany(Nationality, {
//   through: JobSeekerNationalities,
//   foreignKey: "jobSeekerId",
//   otherKey: "nationalityId",
//   as: "nationalities",
// });
// Nationality.belongsToMany(JobSeeker, {
//   through: JobSeekerNationalities,
//   foreignKey: "nationalityId",
//   otherKey: "jobSeekerId",
// });

// // Associations
// JobSeeker.hasMany(JobSeekerWorkPermit, { foreignKey: 'jobSeekerId', as: 'workPermits' });
// JobSeekerWorkPermit.belongsTo(JobSeeker, { foreignKey: 'jobSeekerId' });

// Country.hasMany(JobSeekerWorkPermit, { foreignKey: 'countryId', as: 'countryWorkPermits' });
// JobSeekerWorkPermit.belongsTo(Country, { foreignKey: 'countryId', as: 'country' });
// JobSeeker.belongsToMany(Job, {
//   through: SavedJob,
//   foreignKey: "jobSeekerId",
//   otherKey: "jobId",
//   as: "savedJobs", // ✅ this alias will be used in controllers
// });

// Job.belongsToMany(JobSeeker, {
//   through: SavedJob,
//   foreignKey: "jobId",
//   otherKey: "jobSeekerId",
//   as: "savedByJobSeekers", // optional alias for reverse lookup
// });

// SavedJob.belongsTo(Job, { foreignKey: "jobId", as: "job" });

// // ============================
// module.exports = {
//   JobSeeker,
//   JobSeekerSkills,
//   Skills,
//   Company,
//   JobseekerExperience,
//   JobseekerEducation,
//   JobPreference,
//   ContractType,
//   Department,
//   ContractDurationPreference,
//   Languages,
//   JobSeekerLanguages,
//   Nationality,
//   JobSeekerNationalities,
//   JobPreferenceContractTypes,
//   JobPreferenceContractDurations,
//   JobPreferenceDepartments,
//   JobPreferenceLocations,
//   City,
//   Country,
//   JobSeekerWorkPermit
// };
