/** @format */

let express = require(`express`);
let router = express.Router();
let V3 = require(`../models/v3`);
let comment = require(`../models/Comment`);
let auth = require(`../middleware/auth`);

// protected route

router.use(auth.verifyToken);

router.post(`/`, async (req, res, next) => {
  try {
    let book = await V3.create(req.body);
    res.status(200).json({ book: book });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get(`/`, async (req, res, next) => {
  try {
    let books = await V3.find({});
    res.status(200).json({ books: books });
  } catch (error) {
    res.status(400).send(error);
  }
});

// list tags
router.get(`/tags`, async (req, res, next) => {
  try {
    let tags = await V3.aggregate([{ $unwind: "$tags" }]).sort({ tags: 1 });
    res.status(200).json({ tags: tags });
  } catch (error) {
    res.status(400).send(error);
  }
});

// list book by category

router.get(`/category`, async (req, res, next) => {
  try {
    let books = await V3.aggregate([
      {
        $group: { _id: "$category" },
      },
    ]);
    res.status(200).json({ books: books });
  } catch (error) {
    res.status(400).send(error);
  }
});

// get count of number of books for each tag

router.get(`/count`, async (req, res, next) => {
  try {
    let tags = await V3.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
    ]);
    res.status(200).json({ tags: tags });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
