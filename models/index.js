"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Sequelize Connected");
  })
  .catch((err) => {
    console.log(`Sequelize Error ${err}`);
  });

// Import models
const User = require("./user.js")(sequelize, Sequelize.DataTypes);
const Service = require("./service.js")(sequelize, Sequelize.DataTypes);
const Schedule = require("./schedule.js")(
  sequelize,
  Sequelize.DataTypes
);
const Appointment = require("./appointment.js")(sequelize, Sequelize.DataTypes);
const Holiday = require("./holiday.js")(
  sequelize,
  Sequelize.DataTypes
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = User;
db.Service = Service;
db.Schedule = Schedule;
db.Appointment = Appointment;
db.Holiday = Holiday;


// Sync the database
db.sequelize
  .sync({ force: false })
  .then(() => {
    console.log("re-sync is done");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

module.exports = db;
