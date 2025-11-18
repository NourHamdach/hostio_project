require("dotenv").config();
const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground" // must match how you got the token
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

async function test() {
  try {
    const { token } = await oauth2Client.getAccessToken();
    console.log("✅ Access Token received:", token);
  } catch (err) {
    console.error("❌ Failed to get access token:", err.message);
  }
}

test();
