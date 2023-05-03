"use strict";

module.exports = {
  testEnvironment: "node",
  test: "cross-env NODE_ENV=test jest --testTimeout=10000",
  pretest: "cross-env NODE_ENV=test npm run db:reset",
  "db:create:test": "cross-env NODE_ENV=test npx sequelize-cli db:create"
};