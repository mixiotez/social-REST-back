const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SocialNetworkSchema = new Schema({
	type: {
		type: String,
		required: true,
		enum: ['Twitter']
	},
	name: String,
	username: String,
	socialNetworkId: String,
	profilePicture: String,
	token: {
		type: String,
		required: true
	},
	tokenSecret: {
		type: String,
		required: true
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}
});

module.exports = mongoose.model('SocialNetwork', SocialNetworkSchema);
