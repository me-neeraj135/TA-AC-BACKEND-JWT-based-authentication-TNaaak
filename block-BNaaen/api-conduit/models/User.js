/** @format */

let mongoose = require(`mongoose`);
let Schema = mongoose.Schema;
let bcrypt = require(`bcrypt`);
let jwt = require(`jsonwebtoken`);

let userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, match: /@/, unique: true },
    password: { type: String, required: true, minlength: 5 },
    bio: { type: String, trim: true },
    image: { type: String },
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    articleId: [{ type: Schema.Types.ObjectId, ref: "Article" }],
  },
  { timestamps: true }
);

// hash password

userSchema.pre(`save`, async function (next) {
  try {
    if (this.password && this.isModified(`password`)) {
      this.password = await bcrypt.hash(this.password, 10);
      return next();
    }
  } catch (error) {
    next(error);
  }
});

// verify password

userSchema.methods.verifyPassword = async function (password) {
  try {
    let result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    next(error);
  }
};

// generate token

userSchema.methods.signInToken = async function () {
  var payload = { userId: this._id, email: this.email };
  try {
    var token = await jwt.sign(payload, process.env.SECRET);
    return token;
  } catch (error) {
    next(error);
  }
};

// user profile

userSchema.methods.userInfo = function (token) {
  return {
    email: this.email,
    username: this.username,
    bio: this.bio,
    image: this.image,
    following: this.following,
    token: token,
  };
};

module.exports = mongoose.model(`User`, userSchema);

// {
//   "user": {
//     "email": "jake@jake.jake",
//     "token": "jwt.token.here",
//     "username": "jake",
//     "bio": "I work at statefarm",
//     "image": null
//   }
// }
