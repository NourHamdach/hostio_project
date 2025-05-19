// utils/otp.js
const crypto = require('crypto');

function generateOTP(length = 6) {
  // Generates a random integer with the specified number of digits
  const min = 10 ** (length - 1);
  const max = 10 ** length;
  return crypto.randomInt(min, max).toString();
}

module.exports = { generateOTP };
