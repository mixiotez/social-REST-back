const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SocialNetworkSchema = new Schema({
  type: {
    type: String,
    require: true
  },
  name: {
    type: String,
    require: true
  },
  token: {
    type: String,
    require: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment',
    require: true
  }
});

module.exports = mongoose.model('SocialNetwork', SocialNetworkSchema);