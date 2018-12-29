const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email: email });
	if (!user) return res.status(400).json({ msg: "There's no account associated with this email" });

	const validPassword = bcrypt.compareSync(password, user.password);

	if (!validPassword) return res.status(500).json({ msg: "Invalid password" });

	const token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: "2 days" });

	delete user._doc.password;

	res.status(200).json({ user, token, message: "Logged in successfully" });

});

// Logout
router.post('/logout', (req, res) => {
	req.logout();
	res.status(200).json({ message: 'Log out success!' });
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
