require("dotenv").config();

var express = require("express");
var cors = require("cors");
var mongoose = require("mongoose");

// Routes
var authRoutes = require("./routes/auth.routes");
var skillRoutes = require("./routes/skill.routes");
var userRoutes = require("./routes/user.routes");

// Middleware
var errorHandler = require("./middlewares/errorHandler");

var app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(function () {
    console.log("✅ MongoDB connected");
  })
  .catch(function (err) {
    console.error("❌ MongoDB connection error:", err);
  });

// 🧩 Middleware stack
app.use(cors());
app.use(express.json());

// 🚏 Route mounting
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/users", userRoutes);

// ✅ Root route to confirm backend is alive
app.get("/", function (req, res) {
  res.send("SkillUp backend is running 🔧");
});

// 🔥 Error handling
app.use(errorHandler);

// 🖥️ Start the server
var PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
  console.log("🚀 Server running on port " + PORT);
});

