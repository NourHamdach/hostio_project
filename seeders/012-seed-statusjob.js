'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const statusJobs = [
      { statusId: 1, statusName: 'Open' }, 
      { statusId: 2, statusName: 'Closed' },
      { statusId: 3, statusName: 'Expired' },
      { statusId: 4, statusName: 'Draft' },
      { statusId: 5, statusName: 'Rejected' },
      { statusId: 6, statusName: 'Deleted' }
    ];

    // ✅ Insert each status individually with conflict handling
    for (const status of statusJobs) {
      await queryInterface.sequelize.query(`
        INSERT INTO "StatusJobs" ("statusId", "statusName") 
        VALUES (${status.statusId}, '${status.statusName}')
        ON CONFLICT ("statusId") DO NOTHING;
      `);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('StatusJobs', null, {});
  }
};