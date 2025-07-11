import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import cacheRoutes from "./routes/cacheRoutes.js"; // 💡 Make sure this file exists!

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routing
app.use("/api", authRoutes);
app.use("/api", cacheRoutes);

// Health check
app.get("/api/ping", (req, res) => {
  res.json({ message: "API is alive 🚀" });
});

// Start server after MongoDB connects
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running ✅");

      // Log every registered route
      setImmediate(() => {
        if (app._router?.stack) {
          console.log("📦 Registered routes:");
          app._router.stack
            .filter((layer) => layer.route)
            .forEach((layer) => {
              const methods = Object.keys(layer.route.methods)
                .map((m) => m.toUpperCase())
                .join(", ");
              console.log(`➡️  [${methods}] ${layer.route.path}`);
            });
        } else {
          console.warn("⚠️ app._router not ready — skipping route dump.");
        }
      });
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

