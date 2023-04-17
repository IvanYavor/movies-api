const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({
      status: 0,
      error: {
        fields: {
          token: "REQUIRED",
        },
        code: "FORMAT_ERROR",
      },
    });
  }

  token = token.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.token = decoded;
  } catch (err) {
    return res.status(401).json({
      status: 0,
      error: {
        fields: {
          token: "REQUIRED",
        },
        code: "INVALID_TOKEN",
      },
    });
  }
  return next();
};

module.exports = verifyToken;
