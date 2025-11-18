"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("SavedJobs", {
      savedJobId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      jobSeekerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "JobSeekers",
          key: "jobSeekerId",
        },
        onDelete: "CASCADE",
      },
      jobId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Jobs",
          key: "jobId",
        },
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addConstraint("SavedJobs", {
      fields: ["jobSeekerId", "jobId"],
      type: "unique",
      name: "unique_saved_job_constraint", // ✅ Prevents duplicates
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("SavedJobs");
  },
};
