#!/usr/bin/env node

/**
 * Database Management CLI
 * Provides easy commands for database operations
 */

const { 
  initializeDatabase, 
  syncDevelopment, 
  syncProduction, 
  resetDatabase, 
  createTables, 
  checkDatabaseStatus,
  closeDatabase 
} = require("../config/database/sync");

const config = require("../config/app.config");

const commands = {
  init: "Initialize database with associations and sync",
  sync: "Sync database (development mode with alter)",
  "sync-prod": "Sync database (production mode - safe)",
  reset: "Reset database (WARNING: drops all tables - dev only)",
  create: "Create tables without dropping existing ones",
  status: "Check database connection and model status",
  help: "Show this help message"
};

const showHelp = () => {
  console.log("\n🗄️  Database Management Commands:");
  console.log("=====================================");
  Object.entries(commands).forEach(([cmd, desc]) => {
    console.log(`  npm run db:${cmd.padEnd(10)} - ${desc}`);
  });
  console.log("\nExamples:");
  console.log("  npm run db:status     # Check database status");
  console.log("  npm run db:sync       # Sync in development");
  console.log("  npm run db:reset      # Reset database (dev only)");
  console.log("");
};

const runCommand = async (command) => {
  try {
    console.log(`🔄 Running database command: ${command}`);
    console.log(`📊 Environment: ${config.NODE_ENV}`);

    switch (command) {
      case "init":
        await initializeDatabase();
        break;
        
      case "sync":
        await syncDevelopment();
        break;
        
      case "sync-prod":
        await syncProduction();
        break;
        
      case "reset":
        await resetDatabase();
        break;
        
      case "create":
        await createTables();
        break;
        
      case "status":
        await checkDatabaseStatus();
        break;
        
      case "help":
        showHelp();
        return;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }

    console.log("✅ Database command completed successfully");
    
  } catch (error) {
    console.error(`❌ Database command failed: ${error.message}`);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
};

// Get command from command line arguments
const command = process.argv[2];

if (!command) {
  console.error("❌ No command provided");
  showHelp();
  process.exit(1);
}

// Run the command
runCommand(command);
