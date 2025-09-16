const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  loginTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Login', loginSchema);
