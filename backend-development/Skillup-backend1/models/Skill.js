const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  endorsements: [{ type: mongoose.Schema.Types.ObjectId, ref: "Endorsement" }]
});

module.exports = mongoose.model("Skill", skillSchema);

