const mongoose = require('mongoose');

const endorsementSchema = new mongoose.Schema({
  message: String,
  author: String,
  timestamp: { type: Date, default: Date.now }
});

const profileSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  initials: String,
  role: String,
  location: String,
  skills: [String], 
  endorsements: [endorsementSchema],
  projects: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', profileSchema);

