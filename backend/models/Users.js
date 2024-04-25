const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  pass: String,
  photoPath: String
});

const User = mongoose.model('users', userSchema);

module.exports = User;
