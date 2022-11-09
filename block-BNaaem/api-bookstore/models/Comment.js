/** @format */

let mongoose = require(`mongoose`);
let Schema = mongoose.Schema;

let commentSchema = new Schema({
  comment: { type: String, required: true },
  commenter: { type: String, required: true },
  v1Id: [{ type: Schema.Types.ObjectId, ref: "V1" }],
  v2Id: [{ type: Schema.Types.ObjectId, ref: "V2" }],
  v3Id: [{ type: Schema.Types.ObjectId, ref: "V3" }],
});

module.exports = mongoose.model(`Comment`, commentSchema);
