'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Jobs', 'availability');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Jobs', 'availability', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  }
};