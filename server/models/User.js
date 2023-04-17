const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db/index");

class User extends Model {}

User.init(
  {
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "user",
  }
);

module.exports = User;
