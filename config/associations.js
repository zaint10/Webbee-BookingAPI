const setupAssociations = (models) => {
  const {
    User,
    Service,
    BookableSlot,
    BusinessOffDay,
    Configuration,
    Booking,
  } = models;

  // Define associations
  User.hasMany(Booking);
  Booking.belongsTo(User);

  Service.hasMany(Configuration);
  Configuration.belongsTo(Service);

  Service.hasMany(BookableSlot);
  BookableSlot.belongsTo(Service);

  Service.hasMany(BusinessOffDay);
  BusinessOffDay.belongsTo(Service);
};

module.exports = setupAssociations;
