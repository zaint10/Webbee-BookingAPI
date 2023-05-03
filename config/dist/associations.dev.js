"use strict";

var setupAssociations = function setupAssociations(models) {
  var User = models.User,
      Service = models.Service,
      Schedule = models.Schedule,
      Appointment = models.Appointment,
      Holiday = models.Holiday; // Define associations

  User.hasMany(Appointment, {
    foreignKey: 'user_id'
  });
  Appointment.belongsTo(User, {
    foreignKey: 'user_id'
  });
  Service.hasMany(Schedule, {
    foreignKey: 'service_id'
  });
  Schedule.belongsTo(Service, {
    foreignKey: 'service_id'
  });
  Schedule.hasMany(Appointment, {
    foreignKey: 'schedule_id'
  });
  Appointment.belongsTo(Schedule, {
    foreignKey: 'schedule_id'
  });
  Service.hasMany(Holiday, {
    foreignKey: 'service_id'
  });
  Holiday.belongsTo(Service, {
    foreignKey: 'service_id'
  });
};

module.exports = setupAssociations;