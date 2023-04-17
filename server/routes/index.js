const express = require("express");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

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
router.post(
  "/movies/import",
  auth,
  upload.single("file"),
  moviesController.importFile
);

module.exports = router;
