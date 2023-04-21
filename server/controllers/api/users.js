const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const { validateEmail } = require("../../utils/validation");

const create = async function (req, res) {
  try {
    const body = req.body;

    const { name, email, password, confirmPassword } = body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        status: 0,
        error: {
          fields: {
            email: "NOT_SPECIFIED",
            name: "NOT_SPECIFIED",
            password: "NOT_SPECIFIED",
            confirmPassword: "NOT_SPECIFIED",
          },
          code: "NOT_ALL_PARAMETERS",
        },
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        status: 0,
        error: {
          fields: {
            email: "NOT_CORRECT",
          },
          code: "INCORRECT_EMAIL",
        },
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 0,
        error: {
          fields: {
            password: "NOT_CORRECT",
            confirmPassword: "NOT_CORRECT",
          },
          code: "PASSWORDS_NOT_MATCH",
        },
      });
    }

    // check if user already exist
    // Validate if user exist in our database
    const userExist = await User.findOne({ where: { email } });

    if (userExist) {
      return res.status(409).json({
        status: 0,
        error: {
          fields: {
            email: "NOT_UNIQUE",
          },
          code: "EMAIL_NOT_UNIQUE",
        },
      });
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await User.create({
      name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign({ user_id: user.id, email }, process.env.TOKEN_KEY, {
      expiresIn: "2h",
    });

    // return new user
    res.status(201).json({ status: 1, token });
  } catch (err) {
    return res.status(400).json({ status: 0, err: err.message });
  }
};

module.exports = { create };
