'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Companies', 'hasPremiumPlan', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('Companies', 'premiumSince', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Companies', 'premiumExpires', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Companies', 'jobLimit', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1, // default for non-premium verified companies
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Companies', 'hasPremiumPlan');
    await queryInterface.removeColumn('Companies', 'premiumSince');
    await queryInterface.removeColumn('Companies', 'premiumExpires');
    await queryInterface.removeColumn('Companies', 'jobLimit');
  }
};
