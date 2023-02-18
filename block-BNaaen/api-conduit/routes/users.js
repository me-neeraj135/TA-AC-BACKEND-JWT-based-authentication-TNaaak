/** @format */

var express = require("express");
var router = express.Router();
var User = require(`../models/User`);
var jwt = require(`jsonwebtoken`);
var auth = require(`../middleware/auth`);
const { route } = require("../app");

// user login

router.post(`/login`, async (req, res, next) => {
  var { email, password } = req.body.user;
  if (!email || !password) {
    return res.status(400).json({ error: `email/password required` });
  }

  try {
    var user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "email not register" });

    var result = await user.verifyPassword(password);
    if (!result) return res.status(400).json({ error: `invalid password` });

    // generate token
    var token = await user.signInToken();

    res.status(200).json({ user: user.userInfo(token) });
  } catch (error) {
    next(error);
  }
});

//user register

router.post(`/`, async (req, res, next) => {
  let userObj = {
    username: req.body.user.username,
    email: req.body.user.email,
    password: req.body.user.password,
    bio: req.body.user.bio,
    image: req.body.user.image,
  };

  // console.log(userObj);
  try {
    var user = await User.create(userObj);
    var token = await user.signInToken();

    res.status(200).json({ user: user.userInfo(token) });
  } catch (error) {
    next(error);
  }
});

// Get Current User
// Authentication required, returns a User that's the current user

router.get(`/`, auth.verifyToken, async (req, res, next) => {
  try {
    let user = await User.findById(req.user.userId);
    var userInfo = await user.userInfo(req.headers.authorization);
    res.status(200).json({
      user: {
        email: userInfo.email,
        bio: userInfo.bio ? userInfo.bio : "",
        image: userInfo.image ? userInfo.image : "",
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update User
// Authentication required, returns a User that's the current user

router.put(`/`, auth.verifyToken, async (req, res, next) => {
  let userObj = {
    email: req.body.user.email,
    bio: req.body.user.bio,
    image: req.body.user.image,
  };

  try {
    var user = await User.findByIdAndUpdate(req.user.userId, userObj, {
      new: true,
    });
    var userInfo = await user.userInfo(req.headers.authorization);
    res.status(200).json({
      user: {
        email: userInfo.email,
        bio: userInfo.bio,
        image: userInfo.image,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
