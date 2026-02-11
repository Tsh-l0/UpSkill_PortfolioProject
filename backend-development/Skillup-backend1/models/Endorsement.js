const mongoose = require("mongoose");

const endorsementSchema = new mongoose.Schema({
  endorser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  endorsedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
  note: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Endorsement", endorsementSchema);

