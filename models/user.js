const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 20 }, // Default 20 stars
});

module.exports = mongoose.model('User', UserSchema);
