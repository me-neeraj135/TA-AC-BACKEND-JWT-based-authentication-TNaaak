/** @format */

let mongoose = require(`mongoose`);
let Schema = mongoose.Schema;
let User = require(`../models/User`);

let commentSchema = new Schema(
  {
    body: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    articleId: { type: Schema.Types.ObjectId, ref: "Article" },
  },
  { timestamps: true }
);

module.exports = mongoose.model(`Comment`, commentSchema);
