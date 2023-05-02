const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BusinessHour extends Model {}

  BusinessHour.init(
    {
      service_id: DataTypes.INTEGER,
      day_of_week: DataTypes.INTEGER,
      start_time: DataTypes.TIME,
      end_time: DataTypes.TIME,
    },
    { sequelize, modelName: "businessHour" }
  );

  return BusinessHour;
};
