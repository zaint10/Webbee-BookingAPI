const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Holiday extends Model {}
  Holiday.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'services',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Holiday',
    timestamps: false
  });

  return Holiday;
};
