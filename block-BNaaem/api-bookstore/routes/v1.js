/** @format */

let express = require(`express`);
let router = express.Router();
let V1 = require(`../models/v1`);
let comment = require(`../models/Comment`);

router.post(`/`, async (req, res, next) => {
  try {
    let book = await V1.create(req.body);
    res.status(200).json({ book: book });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get(`/`, async (req, res, next) => {
  try {
    let books = await V1.find({});
    res.status(200).json({ books: books });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
