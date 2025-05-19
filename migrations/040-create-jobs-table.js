'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Jobs', {
      jobId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Companies',
          key: 'companyId',
        },
        onDelete: 'CASCADE',
      },
      contractId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ContractTypes',
          key: 'contractTypeId',
        },
        onDelete: 'SET NULL',
      },
      jobTitle: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      numberOfPositions: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      duration: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      latestStartDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      payRange: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      generalRequirements: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      hospitalityExperienceRequired: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      restrictToSameDepartmentExperience: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      minimumSeniority: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      accommodation: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      otherBenefits: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      applicationMethod: {
        type: Sequelize.ENUM('easy apply'),
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Jobs');
  },
};
