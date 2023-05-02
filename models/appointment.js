const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {}

  Appointment.init({
    user_id: DataTypes.INTEGER,
    service_id: DataTypes.INTEGER,
    appointment_time: DataTypes.DATE,
    duration: DataTypes.INTEGER
  }, { sequelize, modelName: 'appointment' });

  return Appointment;
};
