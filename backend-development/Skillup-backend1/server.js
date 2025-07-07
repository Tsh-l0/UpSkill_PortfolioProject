const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

//  Import Routes
const authRoutes = require("./routes/auth.routes");
const skillRoutes = require("./routes/skill.routes");

// Middleware
const errorHandler = require("./middlewares/errorHandler");

dotenv.config();

const app = express();

//  Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

//  Middleware
app.use(cors());
app.use(express.json());

//  Routes
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);

//  Catch-All Error Middleware 
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

