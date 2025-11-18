// const Job = require("./Job");
// const JobLanguage = require("./jobRelations/JobLanguage");
// const Language = require("./Languages");
// const Company = require("./Company");
// const ContractType = require("./jobRelations/ContractType");
// const Department = require("./CompanyRelations/Department");
// const JobDepartment = require("./jobRelations/JobDepartment");
// const JobRecruiterContact = require("./jobRelations/JobRecruiterContact");
// const StatusJob=require("./jobRelations/StatusJob")
// const JobExternalLink=require("./jobRelations/JobExternalLink")
// const RejectedJob=require("./jobRelations/RejectedJob")
// const MinimumSeniority = require("./jobRelations/MinimumSeniority");
// const ContractDuration = require("./jobRelations/DurationOfContract");
// const JobApplication = require("./jobRelations/JobApplication");
// const JobSeeker = require("./Jobseeker");
// // ✅ Job -> MinimumSeniority (Many-to-One)
// Job.belongsTo(MinimumSeniority, {
//   foreignKey: "minimumSeniorityId",
//   as: "minimumSeniority",
// });
// MinimumSeniority.hasMany(Job, {
//   foreignKey: "minimumSeniorityId",
//   as: "jobs",
// });

// // ✅ Job -> ContractDuration (Many-to-One)
// Job.belongsTo(ContractDuration, {
//   foreignKey: "durationId",
//   as: "contractDuration",
// });
// ContractDuration.hasMany(Job, {
//   foreignKey: "durationId",
//   as: "jobs",
// });


// // ✅ Job has one recruiter contact
// Job.hasOne(JobRecruiterContact, {
//   foreignKey: "jobId",
//   as: "jobRecruiterContact",
// });
// JobRecruiterContact.belongsTo(Job, {
//   foreignKey: "jobId",
//   as: "job",
// });

// // ✅ Job <-> Department (Many-to-Many)
// Job.belongsToMany(Department, {
//   through: JobDepartment,
//   foreignKey: "jobId",
//   otherKey: "departmentId",
//   as: "departments",
// });
// Department.belongsToMany(Job, {
//   through: JobDepartment,
//   foreignKey: "departmentId",
//   otherKey: "jobId",
//   as: "jobs",
// });

// // ✅ Job <-> Language (Many-to-Many)
// Job.belongsToMany(Language, {
//   through: JobLanguage,
//   foreignKey: "jobId",
//   otherKey: "languageId",
//   as: "languages",
// });
// Language.belongsToMany(Job, {
//   through: JobLanguage,
//   foreignKey: "languageId",
//   otherKey: "jobId",
//   as: "jobs",
// });

// // ✅ Job -> Company (Many-to-One)
// Job.belongsTo(Company, {
//   foreignKey: "companyId",
//   as: "company",
// });
// Company.hasMany(Job, {
//   foreignKey: "companyId",
//   as: "jobs",
// });

// // ✅ Job -> ContractType (Many-to-One)
// Job.belongsTo(ContractType, {
//   foreignKey: "contractId",
//   as: "contractType",
// });
// ContractType.hasMany(Job, {
//   foreignKey: "contractId",
//   as: "jobs",
// });
// // ✅ Job -> StatusJob (Many-to-One)
// Job.belongsTo(StatusJob, {
//   foreignKey: "statusId",
//   as: "statusJob",
// });
// StatusJob.hasMany(Job, {
//   foreignKey: "statusId",
//   as: "jobs",
// });
// Job.hasOne(JobExternalLink, {
//   foreignKey: 'jobId',
//   as: 'externalLink',
// });
// RejectedJob.belongsTo(Job, {
//   foreignKey: 'jobId',
//   as: 'job',
//   onDelete: 'CASCADE',
// });
// Job.hasOne(RejectedJob, {
//   foreignKey: 'jobId',
//   as: 'rejection',
// });
// // Associations
// JobApplication.belongsTo(Job, { foreignKey: "jobId", as: "job" });
// Job.hasMany(JobApplication, { foreignKey: "jobId", as: "applications" });

// JobApplication.belongsTo(JobSeeker, { foreignKey: "jobseekerId", as: "jobseeker" });
// JobSeeker.hasMany(JobApplication, { foreignKey: "jobseekerId", as: "applications" });


// module.exports = {
//   Job,
//   JobLanguage,
//   ContractType,
//   Department,
//   Company,
//   Language,
//   JobDepartment,
//   JobRecruiterContact,
//   JobExternalLink,
//   StatusJob,
//   ContractDuration,
//   MinimumSeniority
// };
