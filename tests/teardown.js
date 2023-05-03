// tests/teardown.js

// Import your Sequelize models
const db = require("../models");
const { database } = require("../config/config.json").test;


// Define a global function to drop the database and disconnect from it
module.exports = async () => {
  // Drop the database
//   await db.sequelize.query(`DROP DATABASE IF EXISTS ${database}`);
  // Disconnect from the database
  await db.sequelize.close();
};
