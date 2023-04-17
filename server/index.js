const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// require("dotenv").config();
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const apiRoutes = require("./routes/index");

const app = express();
const apiPort = process.env.API_PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

app.use("/api/v1", apiRoutes);

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));

module.exports = app;
