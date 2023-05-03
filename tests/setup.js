// globalSetup.js

const { execSync } = require("child_process");
const { database } = require("../config/config.json").test;

module.exports = async () => {
  // Drop and recreate the test database
  try {
    execSync(`npx sequelize-cli db:drop --database ${database} --if-exists`);
  } catch (error) {
    console.log(`Error dropping database: ${error}`);
  }

  try {
    execSync(`npx sequelize-cli db:create --database ${database}`);
  } catch (error) {
    console.log(`Error creating database: ${error}`);
  }

  // Run the database migrations and seeders
  try {
    execSync(`npx sequelize-cli db:migrate --database ${database}`);
    execSync(`npx sequelize-cli db:seed:all --database ${database}`);
  } catch (error) {
    console.log(`Error running migrations and seeders: ${error}`);
  }
};
