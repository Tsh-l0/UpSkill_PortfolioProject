const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api", require("./routes/auth"));

const testRoutes = require("./routes/test");
app.use("/api", testRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT || 5000, () => {
    console.log("Server running ✅");
  }))
  .catch(err => console.error("MongoDB connection error:", err));

