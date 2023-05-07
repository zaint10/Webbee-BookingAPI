const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {}
  Schedule.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'services',
        key: 'id'
      }
    },
    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 6
      }
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    is_off: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    break_start_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    break_end_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    cleaning_start_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    cleaning_end_time: {
      type: DataTypes.TIME,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'schedule',
    timestamps: false
  });

  return Schedule;
};
