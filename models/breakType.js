const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BreakType extends Model {}

  BreakType.init({
    name: DataTypes.STRING,
  }, { sequelize, modelName: 'breakType' });

  return BreakType;
};
