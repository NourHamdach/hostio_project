const express = require("express");
const app = require("./app");

// Import centralized configuration and database sync
const config = require("./config/app.config");
const { autoSync, checkDatabaseStatus, closeDatabase } = require("./config/database/sync");

const PORT = config.PORT;

/**
 * Start the server with proper database initialization
 */
const startServer = async () => {
  try {
    console.log("🚀 Starting Hostio Backend Server...");
    console.log(`📊 Environment: ${config.NODE_ENV}`);
    console.log(`🔧 Port: ${PORT}`);

    // Initialize database with associations and sync
    await autoSync();
    
    // Check database status
    await checkDatabaseStatus();

    // Start the Express server
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running successfully on port ${PORT}`);
      console.log(`🌐 Backend URL: ${config.urls.backend}`);
      console.log(`🎯 Frontend URL: ${config.urls.frontend}`);
    });
    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      console.log(`\n📤 Received ${signal}. Graceful shutdown initiated...`);
      
      server.close(async () => {
        console.log("🔌 HTTP server closed");
        
        // Close database connection
        await closeDatabase();
        
        console.log("✅ Graceful shutdown completed");
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.error("❌ Could not close connections in time, forcefully shutting down");
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught Exception:", error);
      gracefulShutdown("uncaughtException");
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
      gracefulShutdown("unhandledRejection");
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
