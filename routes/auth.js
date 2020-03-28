const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const signature = require('oauth-signature');
const axios = require('axios');

router.post('/login', async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email: email });
	const validPassword = bcrypt.compareSync(password, user.password);

	if (!user || !validPassword) return res.status(400).json({ message: "Incorrect email or password" });

	const token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: "2 days" });

	delete user._doc.password;

	res.status(200).json({ user, token, message: "Logged in successfully" });
});

// Logout
router.post('/logout', (req, res) => {
	req.logout();
	res.status(200).json({ message: 'Log out success!' });
});

// TWITTER
router.get('/twitter', (req, res) => {
	const url = 'https://api.twitter.com/oauth/request_token',
	timestamp = Math.round(new Date().getTime() / 1000),
  parameters = {
      oauth_consumer_key : process.env.CONSUMER_KEY,
      oauth_signature_method : 'HMAC-SHA1',
      oauth_timestamp : timestamp,
      oauth_nonce : timestamp + 'socialRESTNonce',
			oauth_version : '1.0',
			oauth_callback: process.env.ENV === 'DEV' ? 'http://localhost:5000/api/auth/twitter/callback' : 'https://social-rest.herokuapp.com/api/auth/twitter/callback'
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
	.then(response => {
		res.status(200);
		res.redirect(`https://api.twitter.com/oauth/authorize?${response.data}`);
	})
	.catch(err => res.status(500).json({err, message: 'Couldn\'t generate Twitter credentials'}));
});

// router.get('/twitter/callback',
// 	passport.authenticate('twitter', {
// 		session: false,
// 		failureRedirect: '/'
// 	})
// );

module.exports = router;
