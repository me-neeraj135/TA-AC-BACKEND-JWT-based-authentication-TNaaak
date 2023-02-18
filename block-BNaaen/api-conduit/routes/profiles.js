/** @format */

let express = require(`express`);
let router = express.Router();
let User = require(`../models/User`);
let auth = require(`../middleware/auth`);

// Follow user
// POST /api/profiles/:username/follow
// Authentication required, returns a Profile
// No additional parameters required

router.post(`/:username/follow`, auth.verifyToken, async (req, res, next) => {
  let username = req.params.username;
  // console.log(req.user);
  // console.log(req.headers.authorization);
  console.log(req.user.userId, ``);

  try {
    let followingUser = await User.findOneAndUpdate(
      { username },
      { $addToSet: { followers: req.user.userId } },
      { new: true }
    );

    var user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $addToSet: { following: followingUser.id },
      },
      { new: true }
    );
    res.status(200).json({
      profile: {
        username: user.username,
        bio: user.bio,
        image: user.image,
        following: user.following.length > 0 ? true : false,
      },
    });
    // console.log(user, followingUser, `ffflll`);
  } catch (error) {
    next(error);
  }
});

// unFollow
// DELETE /api/profiles/:username/follow
// Authentication required, returns a Profile
// No additional parameters required

router.delete(`/:username/follow`, auth.verifyToken, async (req, res, next) => {
  let username = req.params.username;
  try {
    var unfollowUser = await User.findOneAndUpdate(
      { username },
      { $pull: { followers: req.user.userId } },
      { new: true }
    );
    var user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $pull: { following: unfollowUser.id },
      },
      { new: true }
    );
    var userInfo = await user.userInfo(req.headers.authorization);
    res.status(200).json({
      profile: {
        username: userInfo.username,
        bio: userInfo.bio,
        image: userInfo.image,
        following: userInfo.following.length > 0 ? true : false,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get Profile
// GET /api/profiles/:username
// Authentication optional, returns a Profile

router.get(`/:username`, async (req, res, next) => {
  var username = req.params.username;
  var token = req.headers.authorization;

  try {
    let user = await User.findOne({ username });
    if (token) {
      let userInfo = await user.userInfo(token);
      res.status(200).json({
        profile: {
          username: userInfo.username,
          bio: userInfo.bio,
          image: userInfo.image,
          following: userInfo.following.length > 0 ? true : false,
        },
      });
    } else {
      res.status(200).json({
        profile: {
          username: user.username,
          bio: user.bio,
          image: user.image,
          following: user.following.length > 0 ? true : false,
        },
      });
    }

    res.status(200).json({ userInfo });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
