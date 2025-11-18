const {sequelize} = require("./database");
const { defineAssociations } = require("./relations");
const config = require("../app.config");
const fs = require('fs');
const path = require('path');

/**
 * Database Synchronization
 * Handles syncing {sequelize} models with the database
 */

/**
 * Initialize database - Define associations and sync
 * @param {Object} options - Sync options
 * @param {boolean} options.force - Drop tables before creating (default: false)
 * @param {boolean} options.alter - Alter tables to match models (default: false)
 * @param {boolean} options.logging - Enable logging (default: from config)
 */
const initializeDatabase = async (options = {}) => {
  const {
    force = false,
    alter = false,
    logging = config.database.logging
  } = options;

  try {
    console.log("🔄 Initializing database...");

    // Test database connection first
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    // Define all model associations
    defineAssociations();
    console.log("✅ Model associations defined");

    // Sync database with models
    const syncOptions = {
      force,
      alter,
      logging
    };

    if (force) {
      console.log("⚠️  WARNING: Force sync enabled - All tables will be dropped!");
    }

    if (alter) {
      console.log("🔄 Alter sync enabled - Tables will be modified to match models");
    }

    await sequelize.sync(syncOptions);
    
    if (force) {
      console.log("✅ Database force synchronized - All tables recreated");
    } else if (alter) {
      console.log("✅ Database alter synchronized - Tables updated");
    } else {
      console.log("✅ Database synchronized");
    }

    return { success: true, sequelize};

  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    throw error;
  }
};

/**
 * Sync database in development mode
 * Uses alter: true to update existing tables without dropping data
 */
const syncDevelopment = async () => {
  console.log("🔄 Syncing database in development mode...");
  
  // First sync tables (alter existing, create new)
  const result = await initializeDatabase({
    alter: true,  // ✅ Update tables safely
    logging: true
  });
  
  // Then run smart seeding
  await runSmartSeeders();
  
  return result;
};

/**
 * Sync database in production mode
 * Uses safe sync without force or alter
 */
const syncProduction = async () => {
  console.log("🔄 Syncing database in production mode...");
  return await initializeDatabase({
    force: false,
    alter: false,
    logging: false
  });
};

/**
 * Reset database - WARNING: This will drop all tables
 * Should only be used in development
 */
const resetDatabase = async () => {
  if (config.NODE_ENV === "production") {
    throw new Error("❌ Database reset is not allowed in production!");
  }

  console.log("⚠️  RESETTING DATABASE - All data will be lost!");
  return await initializeDatabase({
    force: true,
    logging: true
  });
};

/**
 * Create database tables without dropping existing ones
 */
const createTables = async () => {
  try {
    console.log("🔄 Creating database tables...");
    
    defineAssociations();
    
    await sequelize.sync({ 
      force: false,
      logging: config.database.logging 
    });
    
    console.log("✅ Database tables created successfully");
    return { success: true };
    
  } catch (error) {
    console.error("❌ Failed to create tables:", error.message);
    throw error;
  }
};

/**
 * Check database connection and model sync status
 */
const checkDatabaseStatus = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    
    // Get all model names
    const models = Object.keys(sequelize.models);
    
    console.log("✅ Database Status:");
    console.log(`   - Connection: Active`);
    console.log(`   - Models loaded: ${models.length}`);
    console.log(`   - Models: ${models.join(", ")}`);
    
    return {
      connected: true,
      modelsCount: models.length,
      models
    };
    
  } catch (error) {
    console.error("❌ Database Status: Connection failed");
    return {
      connected: false,
      error: error.message
    };
  }
};

/**
 * Gracefully close database connection
 */
const closeDatabase = async () => {
  try {
    await sequelize.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database:", error.message);
  }
};

/**
 * Run only seeders that haven't been executed yet
 */
const runSmartSeeders = async () => {
  try {
    console.log("🌱 Checking for new seeders...");
    
    // Create seeder tracking table if it doesn't exist
    await createSeederTrackingTable();
    
    // Get list of executed seeders
    const executedSeeders = await getExecutedSeeders();
    
    // Get all available seeders
    const allSeeders = await getAvailableSeeders();
    
    // Find new seeders
    const newSeeders = allSeeders.filter(
      seeder => !executedSeeders.includes(seeder)
    );
    console.log(`🌱 Found ${newSeeders.length} new seeders to run`);
    if (newSeeders.length === 0) {
      console.log("✅ All seeders already executed");
      return;
    }
    
    console.log(`🌱 Found ${newSeeders.length} new seeders to run`);
    
    // Run new seeders
    for (const seederFile of newSeeders) {
      await runSeeder(seederFile);
      await markSeederAsExecuted(seederFile);
    }
    
    console.log("✅ New seeders completed");
    
  } catch (error) {
    console.error("❌ Smart seeding failed:", error.message);
  }
};

/**
 * Create table to track executed seeders
 */
const createSeederTrackingTable = async () => {
  const [results] = await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "SeederMeta" (
      "name" VARCHAR(255) PRIMARY KEY,
      "executedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
};

/**
 * Get list of already executed seeders
 */
const getExecutedSeeders = async () => {
  try {
    const results = await sequelize.query(
      'SELECT "name" FROM "SeederMeta"',
      { type: sequelize.QueryTypes.SELECT }
    );
    return results.map(row => row.name);
  } catch (error) {
    return []; // Table doesn't exist yet
  }
};


/**
 * Get all available seeder files
 */
const getAvailableSeeders = async () => {
  
  
  const seedersDir = path.join(__dirname, '../../seeders');
  
  if (!fs.existsSync(seedersDir)) {
    return [];
  }
  
  return fs.readdirSync(seedersDir)
    .filter(file => file.endsWith('.js'))
    .sort(); // Run in alphabetical order
};

/**
 * Run a specific seeder
 */
const runSeeder = async (seederFile) => {
  try {
    console.log(`🌱 Running seeder: ${seederFile}`);
    
    const seederPath = path.join(__dirname, '../../seeders', seederFile);
    const seeder = require(seederPath);
    
    const queryInterface = sequelize.getQueryInterface();
    await seeder.up(queryInterface, { sequelize: sequelize.constructor });
    
    console.log(`✅ Seeder completed: ${seederFile}`);
    
  } catch (error) {
    console.error(`❌ Seeder failed: ${seederFile}`, error.message);
    throw error;
  }
};

/**
 * Mark seeder as executed
 */
const markSeederAsExecuted = async (seederFile) => {
  await sequelize.query(
    'INSERT INTO "SeederMeta" ("name") VALUES (?)',
    { replacements: [seederFile] }
  );
};

// Auto-sync based on environment when module is loaded
const autoSync = async () => {
  if (config.NODE_ENV === "development") {
    return await syncDevelopment();
  } else if (config.NODE_ENV === "production") {
    return await syncProduction();
  } else {
    return await createTables();
  }
};

module.exports = {
  initializeDatabase,
  syncDevelopment,
  syncProduction,
  resetDatabase,
  createTables,
  checkDatabaseStatus,
  closeDatabase,
  autoSync,
  sequelize
};
