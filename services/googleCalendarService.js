const { google } = require("googleapis");
const path = require("path");

// Load credentials from your service account
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../config/google-calendar.json"),
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

const calendar = google.calendar({ version: "v3", auth });

module.exports = calendar;
