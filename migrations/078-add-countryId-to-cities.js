"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add `countryId` to Cities
    await queryInterface.addColumn("Cities", "countryId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Countries",
        key: "countryId",
      },
      onDelete: "CASCADE",
    });

    // 2. Add unique constraint on (cityName, countryId)
    await queryInterface.addConstraint("Cities", {
      fields: ["cityName", "countryId"],
      type: "unique",
      name: "unique_city_per_country",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("Cities", "unique_city_per_country");
    await queryInterface.removeColumn("Cities", "countryId");
  },
};
