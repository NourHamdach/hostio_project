'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('JobSeekers', 'gender', {
      type: Sequelize.ENUM('male', 'female', 'other'),
      allowNull: true, // Set to false if you want to make it required later
      defaultValue: 'other',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop ENUM first, then column (Postgres-safe)
    await queryInterface.removeColumn('JobSeekers', 'gender');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_JobSeekers_gender";');
  }
};
