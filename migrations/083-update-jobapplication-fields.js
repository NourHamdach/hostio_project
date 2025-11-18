'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Remove availability
    await queryInterface.removeColumn('JobApplications', 'availability');

    // 2. Modify status ENUM (drop + re-add ENUM is safer in most SQL engines)
    await queryInterface.changeColumn('JobApplications', 'status', {
      type: Sequelize.ENUM('Pending', 'Viewed', 'Hired', 'Rejected'),
      allowNull: false,
      defaultValue: 'Pending',
    });

    // 3. Add phoneNumber and email
    await queryInterface.addColumn('JobApplications', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('JobApplications', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes
    await queryInterface.addColumn('JobApplications', 'availability', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.changeColumn('JobApplications', 'status', {
      type: Sequelize.ENUM("Pending", "Open", "Closed", "Expired", "Draft", "Rejected"),
      allowNull: false,
      defaultValue: "Pending",
    });

    await queryInterface.removeColumn('JobApplications', 'phoneNumber');
    await queryInterface.removeColumn('JobApplications', 'email');
  },
};
