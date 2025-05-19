'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('JobseekerEducations', {
      jobseekerEducationId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      jobseekerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'JobSeekers',
          key: 'jobSeekerId',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      educationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Educations',
          key: 'educationId',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      degree: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('JobseekerEducations');
  }
};
