const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const auth = require("../helpers/auth");
const SocialNetwork = require("../models/SocialNetwork");

router.get('/socialnetworks', auth.verifyToken, (req, res) => {
  const id = req.headers['id'];
  
  SocialNetwork.find({ "owner": ObjectId(id) })
    .then(socialNetworks => {
      res.status(200).json({socialNetworks});
    })
    .catch(err => {
      res.status(500).json({err, message:"We couldn't load your social networks"})
  })
});

module.exports = router;
