"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the 'countryCode' column from 'Countries' table
    await queryInterface.removeColumn("Countries", "countryCode");
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add the 'countryCode' column if the migration is rolled back
    await queryInterface.addColumn("Countries", "countryCode", {
      type: Sequelize.STRING(10),
      allowNull: false,
    });
  },
};
