'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("JobSeekerLanguages", {
      jobSeekerLanguageId: {
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
      languageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Languages",
          key: "languageId",
        },
        onDelete: "CASCADE",
      },
      mandatory: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("JobSeekerLanguages");
  }
};
