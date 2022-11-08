/** @format */

var express = require("express");

var router = express.Router();
var User = require(`../models/User`);

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// register user

router.post(`/register`, async (req, res, next) => {
  try {
    let user = await User.create(req.body);
    var token = await user.signInToken();
    res.status(200).json({ user: user.userinfo(token) });
  } catch (error) {
    next(error);
  }
});

// login user

router.post(`/login`, async (req, res, next) => {
  var { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email/password is required" });
  }
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "email not registered" });
    }

    let result = await user.verifyPassword(password);
    if (!result) {
      return res.status(400).json({ error: "invalid password" });
    }
    // generate token

    var token = await user.signInToken();
    res.json({ user: user.userinfo(token) });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
