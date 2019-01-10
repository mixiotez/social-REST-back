const passport = require("passport");
const TwitterStrategy = require('passport-twitter').Strategy;
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const SocialNetwork = require("../models/SocialNetwork");

// Fetches Twitter credentials
passport.use(new TwitterStrategy({
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_KEY_SECRET,
  callbackURL: "https://social-rest.herokuapp.com/api/auth/twitter/callback",
  includeEmail: true,
  passReqToCallback: true
},
  async (req, token, tokenSecret, profile, cb) => {

    console.log(req.user)

    const existingSocialNetwork = await SocialNetwork.findOne({ $and: [{ type: "Twitter" }, { name: profile.username }] });

    // If the social network already exists, it updates the credentials
    if (existingSocialNetwork)
      return SocialNetwork.findByIdAndUpdate(existingSocialNetwork._id,
        { $set: { token: token, tokenSecret: tokenSecret } },
        (err, socialNetwork) => {
          return cb(err, socialNetwork);
        }
      );

    const socialNetwork = {
      type: 'Twitter',
      name: profile.username,
      token: token,
      tokenSecret: tokenSecret,
      owner: ObjectId("5c27932ef950ff10492d2308")
    };

    SocialNetwork.create(socialNetwork , (err, socialNetwork) => {
      return cb(err, socialNetwork);
    });
  }
));

module.exports = passport;