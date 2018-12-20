const express = require('express');
const router = express.Router();
const SocialNetwork = require("../models/SocialNetwork");
const Twit = require('twit');

let twitter = new Twit({
	consumer_key: process.env.CONSUMER_KEY,
	consumer_secret: process.env.CONSUMER_KEY_SECRET,
	access_token: String,
	access_token_secret: String
});

updateTokens = SocialNetworkId => {
	SocialNetwork.findById(SocialNetworkId)
		.then(socialNetwork => {
			twitter.config.access_token = socialNetwork.token;
			twitter.config.access_token_secret = socialNetwork.tokenSecret;
		});
};

// New tweet
router.post('/:socialNetworkId/new', async (req, res) => {
	const { tweetContent } = req.body;

	if (!tweetContent)
		return res.status(400).json({ message: "Your tweet can't be empty" });

	await updateTokens(req.params.socialNetworkId);

	twitter
		.post('statuses/update', { status: tweetContent })
		.then(() => res.status(201).json({ message: 'Tweet successfully sent' }))
		.catch(err =>
			res.status(500).json({ err, message: 'There was an error, tweet was not sent' })
		);
});

router.delete('/:socialNetworkId/:postId', async (req, res) => {
	await updateTokens(req.params.socialNetworkId);

	twitter
		.post(`statuses/destroy/${req.params.postId}`)
		.then(() => res.status(200).json({ message: 'Tweet successfully removed' }))
		.catch(err =>
			res.status(500).json({ err, message: 'There was an error, tweet was not deleted' })
		);
});

module.exports = router;
