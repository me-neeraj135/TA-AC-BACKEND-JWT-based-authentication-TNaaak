/** @format */

var express = require("express");
var router = express.Router();
var User = require(`../models/User`);
var auth = require(`../middleware/auth`);

/* GET users listing. */
router.get("/", (req, res, next) => {
  res.json({ accessed: "user information" });
});

router.get(`/protected`, auth.verifyToken, (req, res, next) => {
  res.json({ protected: "this is protected route" });
});

router.post(`/register`, async (req, res, next) => {
  try {
    let user = await User.create(req.body);
    let token = await user.signInToken();

    res.status(200).json({ user: user.userinfo(token) });
  } catch (error) {
    next(error);
  }
});

router.post(`/login`, async (req, res, next) => {
  var { email, password } = req.body;
  console.log(email, password);

  if (!email || !password) {
    return res.status(400).json({ error: "email/password required" });
  }
  try {
    var user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "email not register" });
    }
    var result = await user.verifyPassword(password);

    // console.log(user, result);

    if (!result) {
      return res.status(400).json({ error: "invalid password" });
    }
    // generate token

    var token = await user.signInToken();
    // console.log(token);
    res.json({ user: user.userinfo(token) });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
