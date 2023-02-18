/** @format */

let jwt = require(`jsonwebtoken`);
let slug = require(`slugger`);
const { rawListeners } = require("../models/Comment");
let User = require(`../models/User`);

module.exports = {
  verifyToken: async (req, res, next) => {
    var token = req.headers.authorization;
    try {
      if (token) {
        var payload = await jwt.verify(token, process.env.SECRET);
        var user = User.findById(payload.userId);

        if (user) {
          req.user = payload;
        } else {
          res.json({ error: "user not found" });
        }
        next();
      } else {
        res.json({ error: `token required` });
      }
    } catch (error) {
      next(error);
    }
  },

  slug: function (str) {
    var slug;

    // convert to lower case
    slug = str.toLowerCase();

    // remove special characters
    slug = slug.replace(
      /\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi,
      ""
    );
    // The /gi modifier is used to do a case insensitive search of all occurrences of a regular expression in a string

    // replace spaces with dash symbols
    slug = slug.replace(/ /gi, "-");

    // remove consecutive dash symbols
    slug = slug.replace(/\-\-\-\-\-/gi, "-");
    slug = slug.replace(/\-\-\-\-/gi, "-");
    slug = slug.replace(/\-\-\-/gi, "-");
    slug = slug.replace(/\-\-/gi, "-");

    // remove the unwanted dash symbols at the beginning and the end of the slug
    slug = "@" + slug + "@";
    slug = slug
      .replace(/\@\-|\-\@|\@/gi, "")
      .concat("-" + Math.floor(Math.random() * 200));
    return slug;
  },
};
