const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db/index");

class Actor extends Model {}

Actor.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "actor",
  }
);

class Movie extends Model {}

Movie.init(
  {
    title: {
      type: DataTypes.STRING,
    },
    year: {
      type: DataTypes.INTEGER,
    },
    format: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "movie",
  }
);

Movie.belongsToMany(Actor, { through: "MovieActor" });
Actor.belongsToMany(Movie, { through: "MovieActor" });

module.exports = { Movie, Actor, sequelize };
