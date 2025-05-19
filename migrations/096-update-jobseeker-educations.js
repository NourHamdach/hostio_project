"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop educationId column from JobseekerEducations
    await queryInterface.removeColumn("JobseekerEducations", "educationId");
    // Drop old Educations table
    await queryInterface.dropTable("Educations");

    // Add new inline education fields
    await queryInterface.addColumn("JobseekerEducations", "schoolName", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn("JobseekerEducations", "cityId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Cities",
        key: "cityId",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    await queryInterface.addColumn("JobseekerEducations", "countryId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Countries",
        key: "countryId",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove new columns
    await queryInterface.removeColumn("JobseekerEducations", "schoolName");
    await queryInterface.removeColumn("JobseekerEducations", "cityId");
    await queryInterface.removeColumn("JobseekerEducations", "countryId");

    // Re-add educationId
    await queryInterface.addColumn("JobseekerEducations", "educationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // Recreate Educations table
    await queryInterface.createTable("Educations", {
      educationId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      schoolName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },
};
