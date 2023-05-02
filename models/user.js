const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {}

  User.init(
    {
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: DataTypes.STRING,
    },
    { sequelize, modelName: "user" }
  );

  return User;
};
