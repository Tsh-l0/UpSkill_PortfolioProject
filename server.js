require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Routes
const authRoutes = require("./routes/auth.routes");
const skillRoutes = require("./routes/skill.routes");
const userRoutes = require("./routes/user.routes");

// Middleware
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 🧩 Middleware stack
app.use(cors());
app.use(express.json());

// 🚏 Route mounting
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/users", userRoutes);

// 🔥 Error handling
app.use(errorHandler);

// 🖥️ Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

