"use strict";

var fs = require("fs");

var path = require("path");

var Sequelize = require("sequelize");

var process = require("process");

var basename = path.basename(__filename);
var env = process.env.NODE_ENV || "development";

var config = require(__dirname + "/../config/config.json")[env];

var setupAssociations = require("../config/associations");

var db = {};
var sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs.readdirSync(__dirname).filter(function (file) {
  return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js" && file.indexOf(".test.js") === -1;
}).forEach(function (file) {
  var model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);

  db[model.name] = model;
});
Object.keys(db).forEach(function (modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
sequelize.authenticate().then(function () {
  console.log("Sequelize Connected");
})["catch"](function (err) {
  console.log("Sequelize Error ".concat(err));
}); // Import models

var User = require("./user.js")(sequelize, Sequelize.DataTypes);

var Service = require("./service.js")(sequelize, Sequelize.DataTypes);

var Schedule = require("./schedule.js")(sequelize, Sequelize.DataTypes);

var Appointment = require("./appointment.js")(sequelize, Sequelize.DataTypes);

var Holiday = require("./holiday.js")(sequelize, Sequelize.DataTypes); // Set up associations


setupAssociations({
  User: User,
  Service: Service,
  Schedule: Schedule,
  Appointment: Appointment,
  Holiday: Holiday
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = User;
db.Service = Service;
db.Schedule = Schedule;
db.Appointment = Appointment;
db.Holiday = Holiday; // Sync the database

db.sequelize.sync({
  force: false
}).then(function () {
  console.log("re-sync is done");
})["catch"](function (err) {
  console.error("Unable to connect to the database:", err);
});
module.exports = db;