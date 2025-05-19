"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("ContractTypes", [
      {type: "Gig/one-off job" },
      {type: "Part-time" },
      {type: "Full-Time" },
      {type: "Traineeship" },
      {type: "Apprenticeship" },
      {type: "Seasonal" },
      {type: "Graduate Program" },
      {type: "Internship" },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("ContractTypes", null, {});
  },
};
