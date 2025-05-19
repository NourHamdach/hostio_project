"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove old string fields
    await queryInterface.removeColumn("Users", "country");
    await queryInterface.removeColumn("Users", "city");

    // Add new integer fields with foreign keys
    await queryInterface.addColumn("Users", "countryId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Countries",
        key: "countryId",
      },
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("Users", "cityId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Cities",
        key: "cityId",
      },
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "countryId");
    await queryInterface.removeColumn("Users", "cityId");

    await queryInterface.addColumn("Users", "country", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "city", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
