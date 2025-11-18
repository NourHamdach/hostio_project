"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("JobSeekerLanguages", {
      jobSeekerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "JobSeekers",
          key: "jobSeekerId",
        },
        onDelete: "CASCADE",
      },
      languageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Languages",
          key: "languageId",
        },
        onDelete: "CASCADE",
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("JobSeekerLanguages");
  },
};
