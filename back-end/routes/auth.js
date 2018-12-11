const express = require('express');
const router = express.Router();
const passport = require('passport');

// Login
router.post('/login',
	passport.authenticate('local', {
		successRedirect: '/dashboard',
		failureRedirect: '/'
	})
);

// Logout
router.post('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

// TWITTER
router.get('/twitter', passport.authenticate('twitter'));

router.get('/twitter/callback',
	passport.authenticate('twitter', {
		session: false,
		failureRedirect: '/'
	}),
	(req, res) => {
		res.redirect('/dashboard');
	}
);

module.exports = router;
