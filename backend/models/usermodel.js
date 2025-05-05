const mongoose = require('mongoose');
const { startupSchema } = require('./startupmodel');

const userschema = mongoose.Schema({
  username: {
    type: String,
    index: true // Fast lookup during login or filtering
  },
  password: {
    type: String,
  },
  email: {
    type: String,
    unique: true, // Ensures email is not duplicated
    index: true   // Improves email-based lookups
  },
  startup: {
    type: String,
    index: true // Useful if filtering users by startup
  }
}, {
  timestamps: true
});

const usermodel = mongoose.model('user', userschema);
module.exports = usermodel;
