"use strict";

// tests/setup.js
var _require = require("child_process"),
    execSync = _require.execSync;

var path = require("path"); // Run database migrations


execSync("npx sequelize-cli db:migrate", {
  stdio: "inherit"
}); // Run database seeders

execSync("npx sequelize-cli db:seed:all", {
  stdio: "inherit"
}); // Set environment variable for testing

process.env.NODE_ENV = "test";