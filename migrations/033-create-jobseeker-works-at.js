"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("JobseekerWorksAts", {
      workId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      jobseekerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "JobSeekers", 
          key: "jobSeekerId",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Companies", 
          key: "companyId",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("JobseekerWorksAts");
  },
};
