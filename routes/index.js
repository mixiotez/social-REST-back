const express = require('express');
const router  = express.Router();
const SocialNetwork = require("../models/SocialNetwork");

router.get('/dashboard', (req, res, next) => {
  SocialNetwork.find()
    .then(socialNetwork => {
      console.log(socialNetwork);
      res.render('dashboard', { socialNetwork })
    });
});

module.exports = router;
