'use strict';

module.exports = {
  async up(queryInterface, {sequelize}) {
    await queryInterface.bulkInsert('ContractDurationPreferences', [
      { name: 'Less than one month', createdAt: new Date(), updatedAt: new Date() },
      { name: '1-2 months', createdAt: new Date(), updatedAt: new Date() },
      { name: '2-6 months', createdAt: new Date(), updatedAt: new Date() },
      { name: '6-12 months', createdAt: new Date(), updatedAt: new Date() },
      { name: 'More than 1 year', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, {sequelize}) {
    await queryInterface.bulkDelete('ContractDurationPreferences', null, {});
  }
};
