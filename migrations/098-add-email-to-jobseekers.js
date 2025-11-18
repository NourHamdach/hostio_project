"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("JobSeekers", "email", {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("JobSeekers", "email");
  },
};
