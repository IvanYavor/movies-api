const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../../models/User");

const create = async (req, res) => {
  try {
    // Get user input
    const body = req.body;

    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({
        status: 0,
        error: {
          fields: {
            email: "NOT_SPECIFIED",
            password: "NOT_SPECIFIED",
          },
          code: "NOT_ALL_PARAMETERS",
        },
      });
    }

    // Validate if user exist in database
    const user = await User.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      return res.status(200).json({ status: 1, token });
    }

    return res.status(400).json({
      status: 0,
      error: {
        fields: {
          email: "AUTHENTICATION_FAILED",
          password: "AUTHENTICATION_FAILED",
        },
        code: "AUTHENTICATION_FAILED",
      },
    });
  } catch (err) {
    return res.status(400).json({ status: 0, err: err.message });
  }
};

module.exports = { create };
