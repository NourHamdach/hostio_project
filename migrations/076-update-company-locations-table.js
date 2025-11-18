"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add cityId column
    await queryInterface.addColumn("CompanyLocations", "cityId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Cities",
        key: "cityId",
      },
      onDelete: "CASCADE",
    });

    // ❗ Optional: Recreate composite primary key with cityId included
    // First, drop the existing PK constraint
    await queryInterface.Sequelize.query(`
      ALTER TABLE "CompanyLocations" DROP CONSTRAINT "CompanyLocations_pkey";
    `);

    // Then, add a new composite primary key including cityId
    await queryInterface.Sequelize.query(`
      ALTER TABLE "CompanyLocations"
      ADD PRIMARY KEY ("companyId", "countryId", "cityId");
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to old composite primary key
    await queryInterface.Sequelize.query(`
      ALTER TABLE "CompanyLocations" DROP CONSTRAINT "CompanyLocations_pkey";
    `);

    await queryInterface.Sequelize.query(`
      ALTER TABLE "CompanyLocations"
      ADD PRIMARY KEY ("companyId", "countryId");
    `);

    // Drop the cityId column
    await queryInterface.removeColumn("CompanyLocations", "cityId");
  },
};
