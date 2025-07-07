const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/auth.routes");
const skillRoutes = require("./routes/skill.routes");

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("SkillUp Backend API is running 🚀");
});

module.exports = app;

