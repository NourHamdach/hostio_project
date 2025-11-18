'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('JobApplications', {
      applicationId: {
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
      jobId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Jobs',
          key: 'jobId',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Open', 'Closed', 'Expired', 'Draft', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending',
      },
      applicationDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      cvDocument: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      otherDocuments: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      availability: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addConstraint('JobApplications', {
      fields: ['jobseekerId', 'jobId'],
      type: 'unique',
      name: 'unique_job_application_per_jobseeker',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('JobApplications', 'unique_job_application_per_jobseeker');
    await queryInterface.dropTable('JobApplications');
    await queryInterface.Sequelize.query('DROP TYPE IF EXISTS "enum_JobApplications_status";');
  },
};
