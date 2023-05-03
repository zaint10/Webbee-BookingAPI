"use strict";

// globalSetup.js
var _require = require("child_process"),
    execSync = _require.execSync;

var database = require("../config/config.json").test.database;

module.exports = function _callee() {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // Drop and recreate the test database
          try {
            execSync("npx sequelize-cli db:drop --database ".concat(database, " --if-exists"));
          } catch (error) {
            console.log("Error dropping database: ".concat(error));
          }

          try {
            execSync("npx sequelize-cli db:create --database ".concat(database));
          } catch (error) {
            console.log("Error creating database: ".concat(error));
          } // Run the database migrations and seeders


          try {
            execSync("npx sequelize-cli db:migrate --database ".concat(database));
            execSync("npx sequelize-cli db:seed:all --database ".concat(database));
          } catch (error) {
            console.log("Error running migrations and seeders: ".concat(error));
          }

        case 3:
        case "end":
          return _context.stop();
      }
    }
  });
};