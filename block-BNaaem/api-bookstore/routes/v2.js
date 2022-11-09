/** @format */

let express = require(`express`);
let router = express.Router();
let V2 = require(`../models/v2`);
let comment = require(`../models/Comment`);

router.get(`/`, async (req, res, next) => {
  try {
    let books = await V2.find({});
    res.status(200).json({ books: books });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post(`/`, async (req, res, next) => {
  try {
    let book = await V2.create(req.body);
    res.status(200).json({ book: book });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
