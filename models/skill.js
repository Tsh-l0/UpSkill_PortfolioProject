const mongoose = require("mongoose")

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      lowercase: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    confidenceLevel: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    endorsements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // assuming each endorsement is by a user
      },
    ],
  },
  { timestamps: true }
)

// Index for optimized search/filter performance
skillSchema.index({ category: 1 })
skillSchema.index({ name: "text" })

// Virtual for endorsement count
skillSchema.virtual("endorsementCount").get(function () {
  return this.endorsements.length
})

module.exports = mongoose.model("Skill", skillSchema)

