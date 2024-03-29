const fs = require("fs");
const { Movie, Actor } = require("../../models/Movie");
const { buildListQuery } = require("../../utils/query");
const {
  validateCreateMovie,
  validateUpdateMovie,
} = require("../../utils/validation");

const create = async (req, res) => {
  try {
    const body = req.body;

    const { title, year, format, actors } = body;

    if (!title || !year || !format || !actors?.length) {
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

    if (!validateCreateMovie({ title, year, format })) {
      return res.status(400).json({
        status: 0,
        error: {
          fields: {
            title: "SHOULD_NOT_BE_EMPTY",
            year: "SHOULD_BE_IN_CORRECT_RANGE",
            format: "SHOULD_BE_ONE_OF_VHS_DVD_Blu-ray",
          },
          code: "INCORRECT_PARAMETERS",
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
          id: "NO_SPECIFIED",
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
          id: "NO_SPECIFIED",
        },
        code: "NOT_ALL_PARAMETERS",
      },
    });
  }

  if (!validateUpdateMovie({ title, year, format })) {
    return res.status(400).json({
      status: 0,
      error: {
        fields: {
          title: "SHOULD_NOT_BE_EMPTY",
          year: "SHOULD_BE_IN_CORRECT_RANGE",
          format: "SHOULD_BE_ONE_OF_VHS_DVD_Blu-ray",
        },
        code: "INCORRECT_PARAMETERS",
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
  if (actorsInput?.length > 0) {
    actors = await movieExist.getActors();
    await Actor.destroy({
      where: { id: actors.map((actor) => actor.id) },
    });
  }

  const actorsCreatedPromises = [];
  if (actorsInput) {
    for (const actorName of actorsInput) {
      actorsCreatedPromises.push(Actor.create({ name: actorName }));
    }
  }

  let actorsCreated;
  try {
    actorsCreated = await Promise.all(actorsCreatedPromises);
    await movieExist.addActors(actorsCreated);
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

  movieExist.title = title || movieExist.title;
  movieExist.year = year || movieExist.year;
  movieExist.format = format || movieExist.format;

  let updatedMovie;
  try {
    updatedMovie = await movieExist.update(
      { title, year, format },
      { returning: true }
    );
  } catch (err) {
    return res.status(400).json({
      status: 0,
      error: {
        code: "FAILED_TO_UPDATE_MOVIE",
      },
    });
  }

  return res.status(200).json({
    status: 1,
    data: {
      id: updatedMovie.id,
      title: updatedMovie.title,
      year: updatedMovie.year,
      format: updatedMovie.format,
      actors: actorsCreated.length > 0 ? actorsCreated : actors,
    },
  });
};

const getById = async (req, res) => {
  const movieId = +req.params.movieId;

  if (!movieId) {
    return res.status(400).json({
      status: 0,
      error: {
        fields: {
          id: "NO_SPECIFIED",
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

  let actors = await movieExist.getActors();
  actors = actors.map((actor) => ({
    id: actor.id,
    name: actor.name,
    createdAt: actor.createdAt,
    updatedAt: actor.updatedAt,
  }));

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

const list = async (req, res) => {
  const { actor, title, search, sort, order, limit, offset } = req.query;

  const options = buildListQuery({
    actor,
    title,
    search,
    sort,
    order,
    limit,
    offset,
  });

  try {
    const movies = await Movie.findAll(options);

    return res.status(200).json({
      status: 1,
      meta: {
        total: movies.length,
      },
      data: movies,
    });
  } catch (err) {
    return res.status(500).json({ status: 0, error: err.message });
  }
};

const importFile = async (req, res) => {
  const { movies } = req.body;

  const fileData = fs.readFileSync(movies, "utf-8");
  const parsedJSON = parseIntoJSON(fileData);

  const createdMovies = [];
  for (const movieInfo of parsedJSON) {
    if (validateCreateMovie(movieInfo)) {
      try {
        const createdMovie = await Movie.create({
          title: movieInfo.title,
          year: movieInfo.year,
          format: movieInfo.format,
        });

        const createdActors = [];
        for (const actorName of movieInfo.stars) {
          createdActors.push(await Actor.create({ name: actorName }));
        }

        await createdMovie.addActors(createdActors);
        createdMovies.push(createdMovie);
      } catch (err) {
        return res.status(400).json({ status: 0, error: err.message });
      }
    }
  }

  return res.status(200).send({ status: 1, data: createdMovies });
};

const parseIntoJSON = (fileData) => {
  const movieRegex =
    /^Title: (.+)\nRelease Year: (\d+)\nFormat: (.+)\nStars: (.+)$/gm;

  const movies = [];

  let match;
  while ((match = movieRegex.exec(fileData)) !== null) {
    const movie = {
      title: match[1],
      year: +match[2],
      format: match[3],
      stars: match[4].split(",").map((s) => s.trim()),
    };
    movies.push(movie);
  }

  return movies;
};

module.exports = { create, remove, update, getById, list, importFile };
