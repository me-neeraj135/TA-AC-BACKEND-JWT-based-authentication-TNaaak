/** @format */

let express = require(`express`);
let router = express.Router();
let auth = require(`../middleware/auth`);
let User = require(`../models/User`);
let Article = require(`../models/Article`);
let Comment = require(`../models/Comment`);
const { populate } = require("../models/Comment");
const { model } = require("mongoose");
const { response } = require("express");

// Create Article
// Authentication required, will return an Article
// Required fields: title, description, body
// Optional fields: tagList as an array of Strings

router.post(`/`, auth.verifyToken, async (req, res, next) => {
  let articleObj = {
    slug: auth.slug(req.body.article.title),
    title: req.body.article.title,
    description: req.body.article.description,
    body: req.body.article.body,
    tagList: req.body.article.tagList,
    author: req.user.userId,
  };

  try {
    var article = await (
      await Article.create(articleObj)
    ).populate(`author`, "username bio image following");
    var user = await User.findByIdAndUpdate(req.user.userId, {
      $push: { articleId: article.id },
    });
    res.status(200).json({
      article: {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tagList,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        favorited: article.favorite.length > 0 ? true : false,
        favoritesCount: article.favoriteCount,
        author: {
          username: article.author.username,
          bio: article.author.bio,

          image: article.author.image,
          following: article.author.following.length > 0 ? true : false,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// List Articles
// Returns most recent articles globally by default, provide tag, author or favorited query parameter to filter results
// Authentication optional, will return multiple articles, ordered by most recent first

router.get(`/`, async (req, res, next) => {
  var tag = "";
  var author = "";
  var favorite = "";
  var limit = 20;
  var offset = 0;
  var articles = ``;

  try {
    if (req.query.limit) {
      limit = req.query.limit;
    } else if (req.query.offset) {
      offset = Number(req.query.offset);
    } else if (req.query.tag) {
      tag = req.query.tag;
      articles = await Article.find({ tagList: { $in: [tag] } })
        .limit(limit)
        .skip(offset)
        .populate(`author`, "username bio image following")
        .sort({ createdAt: "desc" });
    } else if (req.query.author) {
      author = req.query.author;
      let user = await User.findOne({ username: author });
      articles = await Article.find({ author: user.id })
        .limit(limit)
        .skip(offset)
        .populate(`author`, "username bio image following")
        .sort({ createdAt: "desc" });
    } else if (req.query.favorite) {
      favorite = req.query.favorite;
      console.log(favorite, `fff`);
      articles = await Article.find({ favorite: { $in: [favorite] } })
        .limit(limit)
        .skip(offset)
        .populate(`author`, "username bio image following")
        .sort({ createdAt: "desc" });
    } else {
      articles = await Article.find({})
        .limit(limit)
        .skip(offset)
        .populate(`author`, "username bio image following")
        .sort({ createdAt: "desc" });
    }

    res.status(200).json({ articles });
  } catch (error) {
    next(error);
  }
});

// Feed Articles
// GET /api/articles/feed
// Can also take limit and offset query parameters like List Articles
// Authentication required, will return multiple articles created by followed users, ordered by most recent first.

router.get(`/feed`, auth.verifyToken, async (req, res, next) => {
  // console.log(req.user, `uid`);
  var limit = 20;
  var offset = 0;
  try {
    if (req.query.limit) {
      limit = Number(req.query.limit);
    }
    if (req.query.offset) {
      offset = Number(req.query.offset);
    }

    var user = await User.findById(req.user.userId);
    var feed = await Article.find({ author: { $in: user.following } })
      .populate(`author`, "username bio image following")
      .limit(limit)
      .skip(offset);

    var articles = feed.map((feed, index) => {
      return {
        slug: feed.slug,
        title: feed.title,
        description: feed.description,
        body: feed.body,
        tagList: feed.tagList,
        createdAt: feed.createdAt,
        updatedAt: feed.updatedAt,
        favorited: feed.favorite.length > 0 ? true : false,
        favoritesCount: feed.favoriteCount,
        author: {
          username: feed.author.username,
          bio: feed.author.bio,
          image: feed.author.image,
          following: feed.author.following.length > 0 ? true : false,
        },
      };
    });
    res.status(200).json({ articles, articleCount: articles.length });
  } catch (error) {
    next(error);
  }
});

// update article
// Authentication required, returns the updated Article
// Optional fields: title, description, body
// The slug also gets updated when the title is changed

router.put(`/:slug`, auth.verifyToken, async (req, res, next) => {
  let articleObj = {
    slug: auth.slug(req.body.article.title),
    title: req.body.article.title,
  };
  try {
    var article = await Article.findOne({ slug: req.params.slug });

    // console.log(article.author.toString(), req.user.userId, `eeee`);

    if (article.author.toString() === req.user.userId) {
      var updatedArticle = await Article.findOneAndUpdate(
        { slug: req.params.slug },
        articleObj,
        { new: true }
      );
      res.status(200).json({ article: updatedArticle });
    } else {
      res.status(400).json({ error: `you are not author of this article` });
    }
  } catch (error) {
    next(error);
  }
});

// Delete Article

router.delete(`/:slug`, auth.verifyToken, async (req, res, next) => {
  try {
    var deletedArticle = await Article.findOneAndDelete({
      slug: req.params.slug,
    });
    if (deletedArticle) {
      var deleteComment = await Comment.deleteMany({
        articleId: deletedArticle._id,
      });
      res.status(200).json({ deletedArticle });
    } else {
      res.json({ error: `article not found` });
    }
  } catch (error) {
    next(error);
  }
});

// Add Comments to an Article
// Authentication required, returns the created Comment
// Required field: body

router.post(`/:slug/comments`, auth.verifyToken, async (req, res, next) => {
  try {
    var article = await Article.findOne({ slug: req.params.slug });

    let commentObj = {
      body: req.body.comment.body,
      author: req.user.userId,
      articleId: article.id,
    };
    if (article) {
      var comment = await (
        await Comment.create(commentObj)
      ).populate(`author`, "username bio image following");

      article.comments.push(comment.id);
      var updatedArticle = await article.save();
      res.status(200).json({
        comment: {
          id: comment.id,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          body: comment.body,
          author: {
            username: comment.author.username,
            bio: comment.author.bio,
            image: comment.author.image,
            following: comment.author.following.length > 0 ? true : false,
          },
        },
      });
    } else {
      res.json({ error: `no article found` });
    }
  } catch (error) {
    next(error);
  }
});

// Get Comments from an Article
// GET /api/articles/:slug/comments
// Authentication optional, returns multiple comments

router.get(`/:slug/comments`, async (req, res, next) => {
  try {
    var article = await Article.findOne({ slug: req.params.slug }).populate({
      path: `comments`,
      populate: {
        path: `author`,
        model: `User`,
      },
    });
    if (article) {
      var comments = article.comments.map((cmt, index) => {
        return {
          id: cmt.id,
          createdAt: cmt.createdAt,
          updatedAt: cmt.updatedAt,
          body: cmt.body,
          author: {
            username: cmt.author.username,
            bio: cmt.author.bio,
            image: cmt.author.image,
            following: cmt.author.following > 0 ? true : false,
          },
        };
      });
      res.status(200).json({ comments });
    } else {
      res.status(400).json({ error: `article not found` });
    }
  } catch (error) {
    next(error);
  }
});

// Delete Comment

router.delete(
  `/:slug/comments/:id`,
  auth.verifyToken,
  async (req, res, next) => {
    let cmtId = req.params.id;

    try {
      var comment = await Comment.findById(cmtId);

      if (comment) {
        var deletedComment = await Comment.deleteOne({ _id: cmtId });

        if (deletedComment) {
          var article = await Article.findOneAndUpdate(
            { slug: req.params.slug },
            { $pull: { comments: cmtId } },
            { new: true }
          );

          res.status(200).json({ article });
        }
      } else {
        res.status(400).json({ error: `comment not found` });
      }
    } catch (error) {
      next(error);
    }
  }
);

// Favorite Article
// POST /api/articles/:slug/favorite
// Authentication required, returns the Article

router.post(`/:slug/favorite`, auth.verifyToken, async (req, res, next) => {
  try {
    var user = await User.findById(req.user.userId);
    var article = await Article.findOneAndUpdate(
      { slug: req.params.slug },
      { $addToSet: { favorite: user.username } },

      { new: true }
    );
    article.favoriteCount = article.favorite.length;
    let updatedArticle = await (
      await article.save()
    ).populate(`author`, `username bio image following`);

    res.status(200).json({ article });
  } catch (error) {
    next(error);
  }
});

// Unfavorite Article
// DELETE /api/articles/:slug/favorite
// Authentication required, returns the Article

router.delete(`/:slug/favorite`, auth.verifyToken, async (req, res, next) => {
  try {
    let user = await User.findById(req.user.userId);
    console.log(user, `ddd`);
    let article = await Article.findOneAndUpdate(
      { slug: req.params.slug },
      { $pull: { favorite: user.username } }
    );

    article.favoriteCount = article.favorite.length;
    let updatedArticle = await (
      await article.save()
    ).populate(`author`, `username bio image following`);
    res.status(200).json({ article: updatedArticle });
  } catch (error) {
    next(error);
  }
});

// GET /api/articles/:slug

router.get(`/:slug`, async (req, res, next) => {
  try {
    let article = await Article.findOne({ slug: req.params.slug }).populate(
      `author`,
      "username bio image following"
    );
    res.status(200).json({ article });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
