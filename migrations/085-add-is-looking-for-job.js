"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // ✅ Add 'isLookingForJob' column to JobSeekers
    return queryInterface.addColumn("JobSeekers", "isLookingForJob", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: "Indicates whether the job seeker is currently looking for a job",
    });
  },

  async down(queryInterface, Sequelize) {
    // 🔁 Remove the column if rolling back
    return queryInterface.removeColumn("JobSeekers", "isLookingForJob");
  },
};
