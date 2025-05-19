'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('JobPreferenceContractType', {
      jobPreferenceId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'JobPreferences',
          key: 'jobPreferenceId',
        },
        onDelete: 'CASCADE',
      },
      contractTypeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ContractTypes',
          key: 'contractTypeId',
        },
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.createTable('JobPreferenceContractDuration', {
      jobPreferenceId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'JobPreferences',
          key: 'jobPreferenceId',
        },
        onDelete: 'CASCADE',
      },
      durationId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ContractDurationPreferences',
          key: 'durationId',
        },
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.createTable('JobPreferenceDepartment', {
      jobPreferenceId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'JobPreferences',
          key: 'jobPreferenceId',
        },
        onDelete: 'CASCADE',
      },
      departmentId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Departments',
          key: 'departmentId',
        },
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.createTable('JobPreferenceLocation', {
      jobPreferenceId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'JobPreferences',
          key: 'jobPreferenceId',
        },
        onDelete: 'CASCADE',
      },
      countryId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Countries',
          key: 'countryId',
        },
        onDelete: 'CASCADE',
      },
      cityId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Cities',
          key: 'cityId',
        },
        onDelete: 'CASCADE',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('JobPreferenceLocation');
    await queryInterface.dropTable('JobPreferenceDepartment');
    await queryInterface.dropTable('JobPreferenceContractDuration');
    await queryInterface.dropTable('JobPreferenceContractType');
  }
};
