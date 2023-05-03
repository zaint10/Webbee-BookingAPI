// tests/setup.js

const { execSync } = require("child_process");
const path = require("path");

// Run database migrations
execSync("npx sequelize-cli db:migrate", { stdio: "inherit" });

// Run database seeders
execSync("npx sequelize-cli db:seed:all", { stdio: "inherit" });

// Set environment variable for testing
process.env.NODE_ENV = "test";
