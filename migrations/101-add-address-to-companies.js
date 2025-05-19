'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Companies', 'address', {
      type: Sequelize.TEXT, // Use TEXT for long addresses
      allowNull: true,
    });

    await queryInterface.addColumn('Companies', 'googlePlaceId', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Companies', 'latitude', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('Companies', 'longitude', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Companies', 'address');
    await queryInterface.removeColumn('Companies', 'googlePlaceId');
    await queryInterface.removeColumn('Companies', 'latitude');
    await queryInterface.removeColumn('Companies', 'longitude');
  },
};
