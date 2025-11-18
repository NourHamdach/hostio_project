"use strict";

/** @type {import('{sequelize}-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("JobLanguages", {
      jobId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Jobs",
          key: "jobId",
        },
        onDelete: "CASCADE",
        primaryKey: true, 
      },
      languageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Languages",
          key: "languageId",
        },
        onDelete: "CASCADE",
        primaryKey: true, 
      },
      mandatory: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("JobLanguages");
  },
};
