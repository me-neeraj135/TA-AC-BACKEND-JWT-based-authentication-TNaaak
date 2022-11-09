/** @format */
let mongoose = require(`mongoose`);
let Schema = mongoose.Schema;

let v2Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

module.exports = mongoose.model(`V2`, v2Schema);
