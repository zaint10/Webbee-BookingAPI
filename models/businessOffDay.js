const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BusinessOffDay extends Model {}

  BusinessOffDay.init({
    service_id: DataTypes.INTEGER,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE
  }, { sequelize, modelName: 'businessOffDay' });

  return BusinessOffDay;
};
