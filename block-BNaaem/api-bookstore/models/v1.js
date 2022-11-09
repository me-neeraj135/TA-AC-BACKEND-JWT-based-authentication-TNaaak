/** @format */

let mongoose = require(`mongoose`);
let Schema = mongoose.Schema;

let v1Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: String, required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

module.exports = mongoose.model(`V1`, v1Schema);
