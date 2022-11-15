/** @format */

let mongoose = require(`mongoose`);
let Schema = mongoose.Schema;
let slug = require(`slugger`);

let articleSchema = new Schema(
  {
    slug: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    body: { type: String, required: true },
    tagList: [{ type: String }],
    favorite: [{ type: String }],
    favoriteCount: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model(`Article`, articleSchema);
