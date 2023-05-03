const setupAssociations = (models) => {
  const {
    User,
    Service,
    Schedule,
    Appointment,
    Holiday,
  } = models;

  // Define associations
  User.hasMany(Appointment, { foreignKey: 'user_id' });
Appointment.belongsTo(User, { foreignKey: 'user_id' });

Service.hasMany(Schedule, { foreignKey: 'service_id' });
Schedule.belongsTo(Service, { foreignKey: 'service_id' });
Schedule.hasMany(Appointment, { foreignKey: 'schedule_id' });
Appointment.belongsTo(Schedule, { foreignKey: 'schedule_id' });

Service.hasMany(Holiday, { foreignKey: 'service_id' });
Holiday.belongsTo(Service, { foreignKey: 'service_id' });
};

module.exports = setupAssociations;
