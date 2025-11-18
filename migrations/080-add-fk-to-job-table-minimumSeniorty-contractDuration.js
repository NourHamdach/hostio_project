'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove old columns
    await queryInterface.removeColumn('Jobs', 'minimumSeniority');
    await queryInterface.removeColumn('Jobs', 'duration');

    // Add new FK columns
    await queryInterface.addColumn('Jobs', 'minimumSeniorityId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'MinimumSeniorities',
        key: 'seniorityId',
      },
      allowNull: true,
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('Jobs', 'durationId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'ContractDurations',
        key: 'durationId',
      },
      allowNull: true,
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert changes
    await queryInterface.removeColumn('Jobs', 'minimumSeniorityId');
    await queryInterface.removeColumn('Jobs', 'durationId');

    await queryInterface.addColumn('Jobs', 'minimumSeniority', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Jobs', 'duration', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
