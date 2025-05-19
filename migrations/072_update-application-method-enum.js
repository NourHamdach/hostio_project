'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Jobs', 'applicationMethod', {
      type: Sequelize.ENUM('on hostio', 'external url'),
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Jobs', 'applicationMethod', {
      type: Sequelize.ENUM('easy apply'),
      allowNull: false
    });
  }
};