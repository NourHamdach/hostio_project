// ✅ MIGRATION FILE to create StatusDemos, RecruitmentNeeds, and Demos tables with NOT NULL constraints
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create StatusDemos table
    await queryInterface.createTable("StatusDemos", {
      statusId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      statusName: {
        type: Sequelize.STRING,
        allowNull: false,
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
      },
    });

    // 2. Create RecruitmentNeeds table
    await queryInterface.createTable("RecruitmentNeeds", {
      recruitmentNeedsId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
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
      },
    });

    // 3. Create Demos table
    await queryInterface.createTable("Demos", {
      demoId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      meetingDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      meetingTime: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phoneCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      recruitmentNeedsId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "RecruitmentNeeds", key: "recruitmentNeedsId" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      calendarEventId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      calendarMeetingLink: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      statusId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "StatusDemos", key: "statusId" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Companies", key: "companyId" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Demos");
    await queryInterface.dropTable("RecruitmentNeeds");
    await queryInterface.dropTable("StatusDemos");
  },
};
