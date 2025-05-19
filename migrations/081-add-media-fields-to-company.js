'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Companies', 'backgroundImageUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Companies', 'mediaUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Companies', 'mediaType', {
      type: Sequelize.ENUM('image', 'video'),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Companies', 'backgroundImageUrl');
    await queryInterface.removeColumn('Companies', 'mediaUrl');
    await queryInterface.removeColumn('Companies', 'mediaType');
  },
};