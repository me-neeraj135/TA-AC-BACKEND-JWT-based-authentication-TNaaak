/** @format */

var express = require("express");
var router = express.Router();
var auth = require(`../middleware/auth`);

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({ dashboard: "this is user dashboard" });
});

router.get("/protected", auth.verifyToken, function (req, res, next) {
  // console.log(req.user);
  res.json({ accessed: "this is protected route" });
});

module.exports = router;
