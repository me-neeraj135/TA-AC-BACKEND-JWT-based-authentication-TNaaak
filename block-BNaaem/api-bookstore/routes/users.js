/** @format */

let express = require(`express`);
let router = express.Router();
let User = require(`../models/User`);

router.post(`/register`, async (req, res, next) => {
  try {
    let user = await User.create(req.body);
    let token = await user.signInToken();
    res.status(200).json({ user: user.userinfo(token) });
  } catch (error) {
    res.status(400).json({ error });
  }
});

// login user

router.post(`/login`, async (req, res, next) => {
  var { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email/password required" });
  }

  try {
    var user = await User.findOne({ email });
    console.log(user, `usss`);

    if (!user) {
      return res.status(400).json({ error: "email not registered" });
    }
    var result = await user.verifyPassword(password);
    console.log(result, `result`);

    if (!result) {
      res.status(400).json({ error: "invalid password" });
    } else {
      var token = await user.signInToken();
      console.log(token, `kkkk`);
      res.status(200).json({ user: user.userinfo(token) });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
