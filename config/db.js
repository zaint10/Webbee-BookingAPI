module.exports = {
  HOST: "localhost",
  USER: "root",
  PORT: '3306',
  PASSWORD: "admin",
  DB: "booking_system",
  dialect: "mysql",

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
