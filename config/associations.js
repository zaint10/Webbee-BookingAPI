const setupAssociations = (models) => {
    const { User, Service, BusinessHour, BreakType, Break, Appointment, BusinessOffDay } = models;
  
    // Define associations
    Service.hasMany(BusinessHour, { foreignKey: 'service_id' });
    BusinessHour.belongsTo(Service, { foreignKey: 'service_id' });
  
    Service.hasMany(Break, { foreignKey: 'service_id' });
    Break.belongsTo(Service, { foreignKey: 'service_id' });
  
    BreakType.hasMany(Break, { foreignKey: 'break_type_id' });
    Break.belongsTo(BreakType, { foreignKey: 'break_type_id' });
  
    User.hasMany(Appointment, { foreignKey: 'user_id' });
    Appointment.belongsTo(User, { foreignKey: 'user_id' });
  
    Service.hasMany(Appointment, { foreignKey: 'service_id' });
    Appointment.belongsTo(Service, { foreignKey: 'service_id' });
  
    Service.hasMany(BusinessOffDay, { foreignKey: 'service_id' });
    BusinessOffDay.belongsTo(Service, { foreignKey: 'service_id' });
  };
  
  module.exports = setupAssociations;
  