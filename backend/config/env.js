// Reads and validates environment variables once, at startup.
// If something important is missing the server stops with a clear message.
require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  KEEP_ALIVE_URL: process.env.KEEP_ALIVE_URL,
  KEEP_ALIVE_ENABLED: process.env.KEEP_ALIVE_ENABLED === 'true',
  TIMEZONE: process.env.TIMEZONE || 'Asia/Kolkata',
};
env.isProduction = env.NODE_ENV === 'production';

const missing = ['MONGO_URI', 'JWT_SECRET'].filter((key) => !env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Copy .env.example to .env and fill in the values.');
  process.exit(1);
}
if (env.isProduction && env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters in production.');
  process.exit(1);
}

module.exports = env;
