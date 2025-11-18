'use strict';

/** @type {import('{sequelize}-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      userId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM("jobseeker", "company"),
        allowNull: false
      },
      otp_code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      otp_expiration: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      authMethod: {
        type: Sequelize.ENUM('google', 'otp'),
        allowNull: false,
        comment: 'Authentication method: google or otp',
      },
      googleId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        comment: 'Stores the Google OAuth user ID',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
