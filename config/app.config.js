require("dotenv").config();

/**
 * Central application configuration
 * Loads environment variables and provides centralized config access
 */

const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3001,

  // Database Configuration
  database: {
    name: process.env.DB_NAME ,
    user: process.env.DB_USER , 
    password: process.env.DB_PASSWORD,
    port: process.env.DATABASE_PORT,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
  },

  // Email Configuration
  email: {
    service: process.env.EMAIL_SERVICE || "gmail",
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || "noreply@hostio.com"
  },

  // Cloudinary Configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },

  // Stripe Configuration
  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },

  // Google OAuth Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  },

  // CORS Configuration
  cors: {
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : ["http://localhost:3000", "http://localhost:3002"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"], // 👈 Add this
  allowedHeaders: ["Content-Type", "Authorization"],     // 👈 Add this
  credentials: true
},


  // File Upload Configuration
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
    allowedFileTypes: {
      images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      documents: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    }
  },

  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100 // limit each IP to 100 requests per windowMs
  },

  // Application URLs
  urls: {
    frontend: process.env.FRONTEND_URL || "http://localhost:3000",
    backend: process.env.BACKEND_URL || "http://localhost:8000"
  }
};

// Validate required environment variables
const requiredEnvVars = [
  "DB_NAME",
  "DB_USER", 
  "JWT_SECRET"
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  process.exit(1);
}

module.exports = config;
