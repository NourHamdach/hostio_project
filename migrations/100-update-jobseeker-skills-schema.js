'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the current table if it has foreign keys (clean start)
    await queryInterface.dropTable('JobSeekerSkills');

    // Recreate the table with direct skill name
    await queryInterface.createTable('JobSeekerSkills', {
      jobSeekerSkillId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      jobSeekerId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      skillName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('JobSeekerSkills');
  }
};
