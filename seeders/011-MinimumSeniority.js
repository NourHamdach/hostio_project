'use strict';

module.exports = {
  async up(queryInterface, {sequelize}) {
    await queryInterface.bulkInsert('MinimumSeniorities', [
      { seniorityLevel: 'More than 0 months' },
      { seniorityLevel: 'More than 6 months' },
      { seniorityLevel: 'More than 12 months' },
      { seniorityLevel: 'More than 2 years' },
      { seniorityLevel: 'More than 5 years' }
    ]);
  },

  async down(queryInterface, {sequelize}) {
    await queryInterface.bulkDelete('MinimumSeniorities', null, {});
  }
};
