const fs = require("fs");
const path = require("path");

const migrationsDir = path.join(__dirname, "migrations");

fs.readdir(migrationsDir, (err, files) => {
  if (err) {
    console.error("❌ Failed to read migrations folder:", err);
    return;
  }

  files.forEach((file) => {
    const filePath = path.join(migrationsDir, file);
    if (!file.endsWith(".js")) return;

    let content = fs.readFileSync(filePath, "utf8");
    let originalContent = content;

    // Fix the function signature: replace { sequelize } with Sequelize
    content = content.replace(
      /async\s+(up|down)\s*\(\s*([^)]+?),\s*\{\s*sequelize\s*\}\s*\)/g,
      "async $1($2, Sequelize)"
    );

    // Also catch arrow functions like: up: async (queryInterface, { sequelize }) => {
    content = content.replace(
      /(up|down)\s*:\s*async\s*\(\s*([^)]+?),\s*\{\s*sequelize\s*\}\s*\)/g,
      "$1: async ($2, Sequelize)"
    );

    // Replace sequelize.INTEGER -> Sequelize.INTEGER, etc.
    content = content.replace(/\bsequelize\.(\w+)/g, "Sequelize.$1");

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅ Fixed: ${file}`);
    } else {
      console.log(`➡️  Skipped (already OK): ${file}`);
    }
  });
});
