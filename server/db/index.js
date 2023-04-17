const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("test", "user", "pass", {
  dialect: "sqlite",
  host: "./dev.sqlite",
});

sequelize
  .sync({ force: true })
  .then(() => console.log("db is ready."))
  .catch((e) => console.error(e));

module.exports = sequelize;
