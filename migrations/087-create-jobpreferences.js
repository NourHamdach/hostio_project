'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('JobPreferences', {
      jobPreferenceId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      jobSeekerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'JobSeekers',
          key: 'jobSeekerId',
        },
        onDelete: 'CASCADE',
      },
      availableFrom: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      isAvailableNow: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      getSuggestedJobEmails: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('JobPreferences');
  }
};
