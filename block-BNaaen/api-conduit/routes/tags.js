/** @format */

let express = require(`express`);
let router = express.Router();
let Article = require(`../models/Article`);
let User = require(`../models/User`);

router.get(`/`, async (req, res, next) => {
  try {
    let tags = await Article.distinct(`tagList`);
    res.status(200).json({ tags });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
