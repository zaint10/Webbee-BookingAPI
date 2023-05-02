const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Break extends Model {}

  Break.init({
    service_id: DataTypes.INTEGER,
    break_type_id: DataTypes.INTEGER,
    start_time: DataTypes.TIME,
    end_time: DataTypes.TIME
  }, { sequelize, modelName: 'break' });

  return Break;
};
