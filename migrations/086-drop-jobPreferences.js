"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop JobSeekerJobPreferences first (dependent table)
    await queryInterface.dropTable("JobSeekerJobPreferences");

    // Then drop JobPreferences
    await queryInterface.dropTable("JobPreferences");
  },

  async down(queryInterface, Sequelize) {
    // Recreate JobPreferences
    await queryInterface.createTable("JobPreferences", {
      preferenceId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      preference: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
    });

    // Recreate JobSeekerJobPreferences
    await queryInterface.createTable("JobSeekerJobPreferences", {
      jobSeekerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "JobSeekers",
          key: "jobSeekerId",
        },
        onDelete: "CASCADE",
      },
      preferenceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "JobPreferences",
          key: "preferenceId",
        },
        onDelete: "CASCADE",
      },
    });
  },
};
