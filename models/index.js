const DBConfig = require("../config/db.js");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(DBConfig.DB, DBConfig.USER, DBConfig.PASSWORD, {
  host: DBConfig.HOST,
  dialect: DBConfig.dialect,
  operatorsAliases: false,
  port: DBConfig.PORT,

  pool: {
    max: DBConfig.pool.max,
    min: DBConfig.pool.min,
    acquire: DBConfig.pool.aqquire,
    idle: DBConfig.pool.idle,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Sequelize Connected");
  })
  .catch((err) => {
    console.log(`Sequelize Error ${err}`);
  });

const setupAssociations = require("../config/associations");

// Import models
const User = require("./user")(sequelize, DataTypes);
const Service = require("./service")(sequelize, DataTypes);
const BusinessHour = require("./businessHour")(sequelize, DataTypes);
const BreakType = require("./breakType")(sequelize, DataTypes);
const Break = require("./break")(sequelize, DataTypes);
const Appointment = require("./appointment")(sequelize, DataTypes);
const BusinessOffDay = require("./businessOffDay")(sequelize, DataTypes);

// Set up associations
setupAssociations({
  User,
  Service,
  BusinessHour,
  BreakType,
  Break,
  Appointment,
  BusinessOffDay,
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = User;
db.Service = Service;
db.BusinessHour = BusinessHour;
db.BreakType = BreakType;
db.Break = Break;
db.Appointment = Appointment;
db.BusinessOffDay = BusinessOffDay;

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
