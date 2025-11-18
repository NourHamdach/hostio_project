"use strict";

module.exports = {
  async up(queryInterface, {sequelize}) {
    await queryInterface.bulkInsert("CompanySizes", [
      {
        sizeName: "Less than 50",
      },
      {
        sizeName: "Between 50 and 200",
      },
      {
        sizeName: "Between 201 and 1000",
      },
      {
        sizeName: "More than 1000",
      },
    ]);
  },

  async down(queryInterface, {sequelize}) {
    await queryInterface.bulkDelete("CompanySizes", {
      sizeName: [
        "Less than 50",
        "Between 50 and 200",
        "Between 201 and 1000",
        "More than 1000",
      ],
    });
  },
};
