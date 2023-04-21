const { Op } = require("sequelize");
const { Actor, sequelize } = require("../models/Movie");

const buildListQuery = ({
  actor,
  title,
  search,
  sort,
  order,
  limit,
  offset,
}) => {
  const options = {
    limit: 20,
    offset: 0,
  };

  if (actor) {
    options.include = [
      {
        model: Actor,
        where: { name: { [Op.substring]: `%${actor}` } },
      },
    ];
  }

  if (title) {
    options.where = {
      title: {
        [Op.substring]: `%${title}`,
      },
    };
  }

  if (search) {
    options.include = [
      {
        model: Actor,
        as: "actors",
        attributes: ["name"],
      },
    ];
    options.where = {
      [Op.or]: [
        { title: { [Op.substring]: `%${search}%` } },
        // TODO search doens't work with actors
        // { "$actors.name$": { [Op.substring]: `%${search}%` } },
      ],
    };
  }

  options.order = [["id", "ASC"]];
  if (["id", "year", "title"].includes(sort)) {
    options.order[0][0] = sort;
  }
  if (["ASC", "DESC"].includes(order)) {
    options.order[0][1] = order;
  }

  if (limit) {
    options.limit = parseInt(limit);
  }

  if (offset) {
    options.offset = parseInt(offset);
  }

  return options;
};

module.exports = { buildListQuery };
