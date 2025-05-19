"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop address field
    await queryInterface.removeColumn("JobSeekers", "address");

    // Add new fields
    await queryInterface.addColumn("JobSeekers", "professionalHeadline", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("JobSeekers", "dateOfBirth", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn("JobSeekers", "hasDrivingLicense", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });

    await queryInterface.addColumn("JobSeekers", "aboutMe", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert additions
    await queryInterface.removeColumn("JobSeekers", "professionalHeadline");
    await queryInterface.removeColumn("JobSeekers", "dateOfBirth");
    await queryInterface.removeColumn("JobSeekers", "hasDrivingLicense");
    await queryInterface.removeColumn("JobSeekers", "aboutMe");

    // Restore address field
    await queryInterface.addColumn("JobSeekers", "address", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
