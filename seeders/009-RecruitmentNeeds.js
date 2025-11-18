"use strict";

module.exports = {
  async up(queryInterface, {sequelize}) {
    const now = new Date();
    await queryInterface.bulkInsert("RecruitmentNeeds", [
      { description: "Hire 1–5 employees per year",createdAt: now, updatedAt: now },
      { description: "Hire up to 10 employees per year",createdAt: now, updatedAt: now },
      { description: "Hire up to 25 employees per year",createdAt: now, updatedAt: now },
      { description: "Hire up to 50 employees per year",createdAt: now, updatedAt: now },
      { description: "Hire up to 100 employees per year",createdAt: now, updatedAt: now },
      { description: "Hire more than 1000 employees per year",createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface, {sequelize}) {
    await queryInterface.bulkDelete("RecruitmentNeeds", {
      description: [
        "Hire 1–5 employees per year",
        "Hire up to 10 employees per year",
        "Hire up to 25 employees per year",
        "Hire up to 50 employees per year",
        "Hire up to 100 employees per year",
        "Hire more than 1000 employees per year",
      ],
    });
  },
};

