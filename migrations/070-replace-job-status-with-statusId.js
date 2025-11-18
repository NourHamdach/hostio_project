'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Create StatusJobs table
    await queryInterface.createTable('StatusJobs', {
      statusId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      statusName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
    });

    // 2️⃣ Insert default statuses
    await queryInterface.bulkInsert('StatusJob', [
      { statusName: 'Pending' },
      { statusName: 'Open' },
      { statusName: 'Closed' },
      { statusName: 'Expired' },
      { statusName: 'Draft' },
      { statusName: 'Rejected' },
    ]);

    // 3️⃣ Add statusId to Jobs table
    await queryInterface.addColumn('Jobs', 'statusId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'StatusJobs',
        key: 'statusId',
      },
      defaultValue: 1, // Assuming 'Pending' has ID = 1
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // 4️⃣ Remove old ENUM status column
    await queryInterface.removeColumn('Jobs', 'status');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Jobs', 'status', {
      type: Sequelize.ENUM('Pending', 'Open', 'Closed', 'Expired', 'Draft', 'Rejected'),
      allowNull: false,
      defaultValue: 'Pending',
    });

    await queryInterface.removeColumn('Jobs', 'statusId');
    await queryInterface.dropTable('StatusJobs');
  }
};
