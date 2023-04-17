const express = require("express");

const auth = require("../middleware/auth");
const usersController = require("../controllers/api/users");
const sessionsController = require("../controllers/api/sessions");
const moviesController = require("../controllers/api/movies");

const router = express.Router();

router.post("/users", usersController.create);
router.post("/sessions", sessionsController.create);

router.post("/movies", auth, moviesController.create);
router.delete("/movies/:movieId", auth, moviesController.remove);
router.patch("/movies/:movieId", auth, moviesController.update);
router.get("/movies/:movieId", auth, moviesController.getById);
router.get("/movies", auth, moviesController.list);

module.exports = router;
