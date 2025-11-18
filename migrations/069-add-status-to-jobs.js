'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Jobs', 'status', {
      type: Sequelize.ENUM('Pending', 'Open', 'Closed', 'Expired', 'Draft', 'Rejected'),
      allowNull: false,
      defaultValue: 'Pending',
    });

    await queryInterface.addColumn('Jobs', 'availability', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Jobs', 'status');
    await queryInterface.removeColumn('Jobs', 'availability');

    await queryInterface.Sequelize.query('DROP TYPE IF EXISTS "enum_Jobs_status";');
  }
};
