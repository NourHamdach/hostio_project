'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.STRING,
      allowNull: true, // ✅ Allow NULL password for Google users
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.STRING,
      allowNull: false, // Rollback: Require password
    });
  },
};
