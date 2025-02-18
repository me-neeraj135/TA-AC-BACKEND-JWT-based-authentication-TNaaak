/** @format */

let mongoose = require(`mongoose`);
let Schema = mongoose.Schema;
let bcrypt = require(`bcrypt`);
let jwt = require(`jsonwebtoken`);

let userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// hash password

userSchema.pre(`save`, async function (next) {
  if (this.password && this.isModified(`password`)) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// verify password

userSchema.methods.verifyPassword = async function (password) {
  try {
    let result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    return error;
  }
};

// generate token

userSchema.methods.signInToken = async function () {
  var payload = { userId: this.id, email: this.email };

  try {
    var token = await jwt.sign(payload, process.env.SECRET);
    return token;
  } catch (error) {
    next(error);
  }
};

// userinfo

userSchema.methods.userinfo = function (token) {
  return {
    name: this.name,
    email: this.email,
    token: token,
  };
};
module.exports = mongoose.model(`User`, userSchema);
