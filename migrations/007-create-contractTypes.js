'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ContractTypes", {
      contractTypeId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ContractTypes");
  },
};
