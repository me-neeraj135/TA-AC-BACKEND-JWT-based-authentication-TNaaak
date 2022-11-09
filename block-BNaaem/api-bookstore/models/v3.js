/** @format */

let mongoose = require(`mongoose`);
let Schema = mongoose.Schema;

let v3Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: String, required: true },
  category: [{ type: String, required: true }],
  tags: [{ type: String }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

module.exports = mongoose.model(`V3`, v3Schema);
