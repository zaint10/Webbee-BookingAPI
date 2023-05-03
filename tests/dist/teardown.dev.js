"use strict";

// tests/teardown.js
// Import your Sequelize models
var db = require("../models");

var database = require("../config/config.json").test.database; // Define a global function to drop the database and disconnect from it


module.exports = function _callee() {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(db.sequelize.close());

        case 2:
        case "end":
          return _context.stop();
      }
    }
  });
};