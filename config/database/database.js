const  {Sequelize} = require("sequelize");
const config = require("../app.config");

/**
 * {sequelize} Database Initialization
 * Creates and configures the main database connection
 */

// Create {sequelize} instance with configuration from app.config.js
const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    dialect: config.database.dialect,
    port: config.database.port,
    logging: config.database.logging,
    pool: config.database.pool,
    define: {
      timestamps: true, // Adds createdAt and updatedAt
      underscored: false, // Use camelCase instead of snake_case
      freezeTableName: true, // Prevent {sequelize} from pluralizing table names
    },
    timezone: "+00:00", // UTC timezone
  }
);

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully");
    return true;
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
    return false;
  }
};

/**
 * Close database connection
 */
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log("✅ Database connection closed successfully");
  } catch (error) {
    console.error("❌ Error closing database connection:", error.message);
  }
};

module.exports = {
  sequelize,
  testConnection,
  closeConnection
};
