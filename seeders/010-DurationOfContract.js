'use strict';

module.exports = {
  async up(queryInterface, {sequelize}) {
    await queryInterface.bulkInsert('ContractDurations', [
      { durationType: 'Indefinite' },
      { durationType: '1 month' },
      { durationType: '2 months' },
      { durationType: '3 months' },
      { durationType: '4 months' },
      { durationType: '5 months' },
      { durationType: '6 months' },
      { durationType: '7 months' },
      { durationType: '8 months' },
      { durationType: '9 months' },
      { durationType: '10 months' },
      { durationType: '11 months' },
      { durationType: '12 months' },
      { durationType: 'More than 1 year' }
    ]);
  },

  async down(queryInterface, {sequelize}) {
    await queryInterface.bulkDelete('ContractDurations', null, {});
  }
};
