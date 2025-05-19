'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("JobSeekerNationalities", {
      jobSeekerNationalityId: {
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
      nationalityId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Nationalities",
          key: "nationalityId",
        },
        onDelete: "CASCADE",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    // ✅ Prevent duplicate nationalities per job seeker
    await queryInterface.addConstraint("JobSeekerNationalities", {
      fields: ["jobSeekerId", "nationalityId"],
      type: "unique",
      name: "unique_jobseeker_nationality",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("JobSeekerNationalities");
  },
};
