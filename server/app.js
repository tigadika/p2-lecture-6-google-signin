require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");

const { User } = require("./models");
const { comparePassword } = require("./helpers/bcrypt");
const { generateToken } = require("./helpers/jwt");
const { OAuth2Client } = require("google-auth-library");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.create({ username, email, password });

    res.json({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "Invalid Email/Password",
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(401).json({
        message: "Invalid Login",
      });
    }

    const compare = comparePassword(password, user.password);

    if (!compare) {
      res.status(401).json({
        message: "Invalid Login",
      });
    }

    const accesss_token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({ accesss_token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

//? flow google login di server
// 1. kita akan mencoba decode access token dari google
// 2. kita akan mencari di db apakah user sudah terdaftar/belum?
// 2a. Kalau user belum terdaftar, maka kita daftarin
// 2b. kalau user sudah terdaftar, maka lanjut
// 3. generate access_token dari server kita sendiri

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
