const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const signature = require('oauth-signature');
const axios = require('axios');
const ObjectId = require('mongoose').Types.ObjectId; 
const SocialNetwork = require("../models/SocialNetwork");
const { verifyToken } = require('../helpers/auth');

router.post('/login', async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email: email });
	const validPassword = bcrypt.compareSync(password, user.password);

	if (!user || !validPassword) return res.status(400).json({ message: "Incorrect email or password" });

	const token = jwt.sign({ id: user._id }, process.env.SECRET);

	delete user._doc.password;

	res.status(200).json({ user, token, message: "Logged in successfully" });
});

router.post('/verifyToken', verifyToken, (req, res) => {
	res.status(200).json({ message: "Valid token" });
});

// TWITTER
router.get('/twitter', (req, res) => {
	const url = 'https://api.twitter.com/oauth/request_token',
	timestamp = Math.round(Date.now() / 1000),
  parameters = {
      oauth_consumer_key : process.env.CONSUMER_KEY,
      oauth_signature_method : 'HMAC-SHA1',
      oauth_timestamp : timestamp,
      oauth_nonce : timestamp + 'socialRESTNonce',
			oauth_version : '1.0',
			oauth_callback: `${process.env.BASE_URL}/auth/twitter/callback?id=${req.query.id}`
	},
	oauth_signature = signature.generate('POST', url, parameters, process.env.CONSUMER_KEY_SECRET);

	let OAuth = "OAuth ";

	for(property in parameters){
		OAuth += `${property}="${parameters[property]}",`;
	}

	OAuth += `oauth_callback="${encodeURIComponent(parameters.oauth_callback)}",oauth_signature="${oauth_signature}"`;

  axios({
		method: 'POST',
		url,
		headers: { 'Authorization': OAuth }
	})
	.then(response => res.redirect(`https://api.twitter.com/oauth/authorize?${response.data.split('&')[0]}`))
	.catch(err => res.status(500).json({err, message: 'Couldn\'t generate Twitter credentials'}));
});

router.get('/twitter/callback', (req, res) => {
	const { id, oauth_token, oauth_verifier } = req.query;
	const OAuth = `OAuth oauth_consumer_key="${process.env.CONSUMER_KEY}",oauth_token="${oauth_token}",oauth_verifier="${oauth_verifier}"`;

	axios({
		method: 'POST',
		url: 'https://api.twitter.com/oauth/access_token',
		headers: { 'Authorization': OAuth }
	})
	.then(async response => {
		const [,token,, tokenSecret,, socialNetworkId,, name] = response.data.split(/=|&/);

		const existingSocialNetwork = await SocialNetwork.findOne(
			{ $and: [{ type: "Twitter" }, { socialNetworkId }, {owner: ObjectId(id)} ] }
		);

    // If the social network already exists, it updates the credentials
    if (existingSocialNetwork)
      return SocialNetwork.findByIdAndUpdate(existingSocialNetwork._id,
				{ $set: { token: token, tokenSecret: tokenSecret }})
				.then(() => res.render('self-closing-window'))
				.catch(err => res.status(500).json({err, message: 'Couldn\'t update credentials'}))

    const socialNetwork = {
      type: 'Twitter',
      name,
      token,
			tokenSecret,
			socialNetworkId,
      owner: ObjectId(id)
    };

		SocialNetwork.create(socialNetwork)
		.then(() => res.render('self-closing-window'))
		.catch(err => res.status(500).json({err, message: 'Couldn\'t save Twitter credentials'}));
	})
	.catch(err => res.status(500).json({err, message: 'Couldn\'t authenticate credentials with Twitter'}));
});

module.exports = router;
