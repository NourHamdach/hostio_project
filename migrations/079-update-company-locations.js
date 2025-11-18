"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove redundant countryId
    await queryInterface.removeColumn("CompanyLocations", "countryId");
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add countryId (reverting)
    await queryInterface.addColumn("CompanyLocations", "countryId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Countries",
        key: "countryId",
      },
      onDelete: "CASCADE",
    });
  },
};
