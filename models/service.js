const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Service extends Model {}
  Service.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slot_duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    max_clients_per_slot: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cleanup_duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    timestamps: false,
    modelName: 'service',
  });

  return Service;
};
