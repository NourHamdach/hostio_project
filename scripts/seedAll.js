const { sequelize } = require('../config/database/database');

async function runAllSeeders() {
  try {
    
    console.log('🌱 Starting database seeding...');
    
    const queryInterface = sequelize.getQueryInterface();
    const Sequelize = sequelize.constructor;
    
    // Run seeders in dependency order
    console.log('📊 Seeding Departments...');
    const seedDepartment = require('../seeders/005-seed-Department.js');
    await seedDepartment.up(queryInterface, { sequelize: Sequelize });
    
    console.log('📊 Seeding Types...');
    const seedTypes = require('../seeders/004-seed-Types.js');
    await seedTypes.up(queryInterface, { sequelize: Sequelize });
    
    console.log('📊 Seeding Skills...');
    const seedSkills = require('../seeders/003-seed-Skills.js');
    await seedSkills.up(queryInterface, { sequelize: Sequelize });
    
    console.log('📊 Seeding Contract Types...');
    const seedContractTypes = require('../seeders/001-seed-contract-types.js');
    await seedContractTypes.up(queryInterface, { sequelize: Sequelize });
    
    console.log('📊 Seeding Languages...');
    const seedLanguages = require('../seeders/006-seed-Languages.js');
    await seedLanguages.up(queryInterface, { sequelize: Sequelize });
    
    console.log('📊 Seeding Company Sizes...');
    const seedCompanySizes = require('../seeders/007-seed-company-sizes.js');
    await seedCompanySizes.up(queryInterface, { sequelize: Sequelize });
    
    console.log('📊 Seeding Status Demos...');
    const seedStatusDemos = require('../seeders/008-StatusDemos.js');
    await seedStatusDemos.up(queryInterface, { sequelize: Sequelize });
    
    console.log('📊 Seeding Recruitment Needs...');
    const seedRecruitmentNeeds = require('../seeders/009-RecruitmentNeeds.js');
    await seedRecruitmentNeeds.up(queryInterface, { sequelize: Sequelize });
    
    console.log('📊 Seeding Contract Durations...');
    const seedContractDurations = require('../seeders/010-DurationOfContract.js');
    await seedContractDurations.up(queryInterface, { sequelize: Sequelize });
    
    console.log('📊 Seeding Minimum Seniorities...');
    const seedMinimumSeniorities = require('../seeders/011-MinimumSeniority.js');
    await seedMinimumSeniorities.up(queryInterface, { sequelize: Sequelize });
    
    console.log('📊 Seeding Contract Duration Preferences...');
    const seedContractDurationPrefs = require('../seeders/013-seed-ContractDurationPreferences.js');
    await seedContractDurationPrefs.up(queryInterface, { sequelize: Sequelize });
    
    console.log('📊 Seeding Nationalities...');
    const seedNationalities = require('../seeders/014-seed-nationalities.js');
    await seedNationalities.up(queryInterface, { sequelize: Sequelize });
    
    console.log('✅ All seeders completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  runAllSeeders().catch(console.error);
}

module.exports = runAllSeeders;