'use strict';

module.exports = {
  up: async (queryInterface, {Sequelize}) => {
    await queryInterface.createTable('Companies', {
      companyId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Users', 
          key: 'userId',
        },
        onDelete: 'CASCADE',
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sizeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'CompanySizes',
          key: 'sizeId',
        },
        onDelete: 'SET NULL',
      },
      foundedYear: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      companyDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      typeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Types',
          key: 'typeId',
        },
        onDelete: 'SET NULL',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Companies');
  },
};
