const { Movie, Actor } = require("../../models/Movie");

const create = async (req, res) => {
  try {
    const body = req.body;

    const { title, year, format, actors } = body;

    if (!title || !year || !format || !actors.length) {
      return res.status(400).json({
        status: 0,
        error: {
          fields: {
            title: "NOT_SPECIFIED",
            year: "NOT_SPECIFIED",
            format: "NOT_SPECIFIED",
            actors: "NOT_SPECIFIED",
          },
          code: "NOT_ALL_PARAMETERS",
        },
      });
    }

    const movieExist = await Movie.findOne({ where: { title } });
    if (movieExist) {
      return res.status(409).json({
        status: 0,
        error: {
          fields: {
            title: "NOT_UNIQUE",
          },
          code: "MOVIE_EXISTS",
        },
      });
    }

    const movie = await Movie.create({
      title,
      year,
      format,
    });

    const actorsCreatedPromises = [];
    for (const actorName of actors) {
      actorsCreatedPromises.push(Actor.create({ name: actorName }));
    }

    let actorsCreated;
    try {
      actorsCreated = await Promise.all(actorsCreatedPromises);
    } catch (err) {
      return res.status(400).json({
        status: 0,
        error: {
          fields: {
            actors: "FAILED_TO_SAVE",
          },
          code: "FAILED_TO_SAVE_ACTORS",
        },
      });
    }

    await movie.addActors(actorsCreated);

    return res.status(200).json({
      data: {
        id: movie.id,
        title: movie.title,
        year: movie.year,
        format: movie.format,
        actors: actorsCreated,
      },
      status: 1,
    });
  } catch (err) {
    return res.status(400).json({ status: 0, err: err.message });
  }
};

const remove = async (req, res) => {
  const movieId = +req.params.movieId;

  if (!movieId) {
    return res.status(400).json({
      status: 0,
      error: {
        fields: {
          id: NO_SPECIFIED,
        },
        code: "NOT_ALL_PARAMETERS",
      },
    });
  }

  const movieExist = await Movie.findOne({ where: { id: movieId } });
  if (!movieExist) {
    return res.status(400).json({
      status: 0,
      error: {
        fields: {
          id: movieId,
        },
        code: "MOVIE_NOT_FOUND",
      },
    });
  }

  let actors;
  try {
    actors = await movieExist.getActors();
    await Actor.destroy({
      where: { id: actors.map((actor) => actor.id) },
    });
  } catch (err) {
    return res.status(400).json({ status: 0, err: err.message });
  }

  actors = actors.map((actor) => ({
    id: actor.id,
    name: actor.name,
    createdAt: actor.createdAt,
    updatedAt: actor.updatedAt,
  }));

  try {
    await movieExist.destroy();
  } catch (err) {
    return res.status(400).json({ status: 0, err: err.message });
  }

  return res.status(200).json({
    status: 1,
    data: {
      id: movieExist.id,
      title: movieExist.title,
      year: movieExist.year,
      format: movieExist.format,
      actors,
    },
  });
};

const update = async (req, res) => {
  const movieId = +req.params.movieId;
  const { title, year, format, actors: actorsInput } = req.body;

  if (!movieId) {
    return res.status(400).json({
      status: 0,
      error: {
        fields: {
          id: NO_SPECIFIED,
        },
        code: "NOT_ALL_PARAMETERS",
      },
    });
  }

  const movieExist = await Movie.findOne({ where: { id: movieId } });
  if (!movieExist) {
    return res.status(400).json({
      status: 0,
      error: {
        fields: {
          id: movieId,
        },
        code: "MOVIE_NOT_FOUND",
      },
    });
  }

  // TODO update actors
  // TODO delete prev ones and create new ones
  const actors = await movieExist.getActors();
  await Actor.destroy({
    where: { id: actors.map((actor) => actor.id) },
  });

  await Actor.create({});

  // TODO update movie
  movieExist.title = title || movieExist.title;
  movieExist.year = year || movieExist.year;
  movieExist.format = format || movieExist.format;

  const [rowsUpdated, [updatedMovie]] = movieExist.update(
    { title, year, format },
    { where: { id: movieExist.id }, returning: true }
  );
};

const list = async (req, res) => {
  const movies = await Movie.findAll({});
  return res.status(200).json({ list: movies });
};

module.exports = { create, remove, update, list };
