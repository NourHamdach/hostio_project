'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('JobSeekerSkills', {
      jobSeekerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'JobSeekers', 
          key: 'jobSeekerId',
        },
        onDelete: 'CASCADE',
        primaryKey: true, // Composite key
      },
      skillsId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Skills', 
          key: 'skillsId',
        },
        onDelete: 'CASCADE',
        primaryKey: true, // Composite key
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('JobSeekerSkills');
  },
};
