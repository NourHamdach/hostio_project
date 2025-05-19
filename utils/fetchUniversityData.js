const axios = require("axios");
require("dotenv").config(); // Ensure this is at the top

const API_URL = process.env.UNIVERSITIES_API_URL;

async function fetchUniversityByName(schoolName, country = null) {
  try {
    const params = { name: schoolName };
    if (country) params.country = country;

    const response = await axios.get(API_URL, { params });

    const universities = response.data;
    if (!Array.isArray(universities) || universities.length === 0) return [];

    // Format all universities returned
    const formatted = universities.map(u => ({
      schoolName: u.name,
      city: u["state-province"] || "Unknown City",
      country: u.country,
    }));

    return formatted;
  } catch (error) {
    console.error("Failed to fetch university data:", error.message);
    return [];
  }
}

module.exports = fetchUniversityByName;
