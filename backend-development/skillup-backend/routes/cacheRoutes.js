import express from "express";
import redisClient from "../utils/redis.js";

console.log("✅ cacheRoutes loaded");

const router = express.Router();

router.get("/test-cache", async (req, res) => {
  console.log("📡 /test-cache route handler hit");

  try {
    const key = "greeting";
    const cachedValue = await redisClient.get(key);

    if (cachedValue) {
      return res.json({ source: "redis", data: cachedValue });
    }

    const value = "Hello SkillUp 👋 ";
    await redisClient.set(key, value, { EX: 30 });

    res.json({ source: "server", data: value });
  } catch (error) {
    console.error("❌ Error in /test-cache route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

