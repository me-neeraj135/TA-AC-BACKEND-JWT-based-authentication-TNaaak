/** @format */

var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send(`Book store api endpoints`);
});

module.exports = router;
