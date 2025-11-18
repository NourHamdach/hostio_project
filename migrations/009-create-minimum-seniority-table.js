'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MinimumSeniorities', {
      seniorityId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      seniorityLevel: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MinimumSeniorities');
  }
};
