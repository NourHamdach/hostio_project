'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('StatusJobs', [
      {
        statusId: 7, // or choose the next available ID
        statusName: 'Deleted',
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('StatusJobs', { statusName: 'Deleted' }, {});
  },
};
