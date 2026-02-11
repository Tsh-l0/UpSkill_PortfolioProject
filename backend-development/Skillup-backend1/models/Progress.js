const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  skillId: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
  level: { type: Number, default: 1 }, // 1–5 confidence scale
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Progress", progressSchema);

