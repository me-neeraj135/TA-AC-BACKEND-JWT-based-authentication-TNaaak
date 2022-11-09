/** @format */

let express = require(`express`);
let router = express.Router();
let Comment = require(`../models/Comment`);
let V1 = require(`../models/v1`);

router.post(`/:id`, async (req, res, next) => {
  try {
    req.body.v1Id = req.params.id;
    let comment = await Comment.create(req.body);
    let book = await V1.findByIdAndUpdate(req.params.id, {
      $push: { comments: comment },
    });
    res.status(200).json({ comment: comment });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
