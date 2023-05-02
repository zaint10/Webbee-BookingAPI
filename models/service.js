const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Service extends Model {}

  Service.init(
    {
      name: DataTypes.STRING,
      duration: DataTypes.INTEGER,
      break_between_appointments: DataTypes.INTEGER,
      max_clients_per_slot: DataTypes.INTEGER,
    },
    { sequelize, modelName: "service" }
  );

  return Service;
};
