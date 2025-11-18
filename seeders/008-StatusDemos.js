'use strict';

module.exports = {
  up: async (queryInterface, {sequelize}) => {
    const now = new Date();
    await queryInterface.bulkInsert("StatusDemos", [
      { statusName: "pending", createdAt: now, updatedAt: now },
      { statusName: "confirmed", createdAt: now, updatedAt: now },
      { statusName: "cancelled", createdAt: now, updatedAt: now },
      { statusName: "done", createdAt: now, updatedAt: now },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("StatusDemos", {
      statusName: ["pending", "confirmed", "cancelled", "done"]
    });
  }
};
