/** @format */

let mongoose = require(`mongoose`);
let Schema = mongoose.Schema;

let cartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  books: [{ type: Schema.Types.ObjectId, ref: "v3" }],
});

module.exports = mongoose.model(`Cart`, cartSchema);
