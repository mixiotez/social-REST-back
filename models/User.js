const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    required: true,
    default: 'user'
  },
  profile_pic: {
    type: String,
    default: 'https://res.cloudinary.com/dj3hdzs7e/image/upload/v1543784645/avatar.png'
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending Confirmation', 'Active'],
    required: true,
    default: 'Pending Confirmation'
  }
}, {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  });

module.exports = mongoose.model('User', UserSchema);