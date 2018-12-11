const passport = require("passport");
const TwitterStrategy = require('passport-twitter').Strategy;
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const User = require("../models/User");
const SocialNetwork = require("../models/SocialNetwork");

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 

// Twitter credentials
passport.use(new TwitterStrategy({
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_KEY_SECRET,
  callbackURL: "http://localhost:3000/api/auth/twitter/callback",
  includeEmail: true,
  passReqToCallback: true
},
  async (req, token, tokenSecret, profile, cb) => {
    const userId = req.user._id;

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
      owner: ObjectId(userId)
    };

    SocialNetwork.create({ socialNetwork }, (err, socialNetwork) => {
      return cb(err, socialNetwork);
    });
  }
));

module.exports = passport;