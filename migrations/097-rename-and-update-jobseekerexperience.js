'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameTable("JobseekerWorksAts", "JobseekerExperience");

    await queryInterface.removeColumn("JobseekerExperience", "companyId");

    await queryInterface.addColumn("JobseekerExperience", "jobTitle", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn("JobseekerExperience", "companyName", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("JobseekerExperience", "departmentId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Departments",
        key: "departmentId",
      },
      onDelete: "SET NULL",
      allowNull: true,
    });

    await queryInterface.addColumn("JobseekerExperience", "cityId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Cities",
        key: "cityId",
      },
      onDelete: "SET NULL",
      allowNull: true,
    });

    await queryInterface.addColumn("JobseekerExperience", "countryId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Countries",
        key: "countryId",
      },
      onDelete: "SET NULL",
      allowNull: true,
    });

    await queryInterface.addColumn("JobseekerExperience", "isCurrent", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn("JobseekerExperience", "description", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameTable("JobseekerExperience", "JobseekerWorksAts");

    await queryInterface.addColumn("JobseekerWorksAts", "companyId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Companies",
        key: "companyId",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.removeColumn("JobseekerWorksAts", "jobTitle");
    await queryInterface.removeColumn("JobseekerWorksAts", "companyName");
    await queryInterface.removeColumn("JobseekerWorksAts", "departmentId");
    await queryInterface.removeColumn("JobseekerWorksAts", "cityId");
    await queryInterface.removeColumn("JobseekerWorksAts", "countryId");
    await queryInterface.removeColumn("JobseekerWorksAts", "isCurrent");
    await queryInterface.removeColumn("JobseekerWorksAts", "description");
  },
};
