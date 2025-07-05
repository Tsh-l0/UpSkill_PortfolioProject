const express = require("express");
const router = express.Router();
const redisClient = require("../utils/redis");

router.get("/test-cache", async (req, res) => {
  const key = "greeting";

  const cachedValue = await redisClient.get(key);

  if (cachedValue) {
    return res.json({ source: "redis", data: cachedValue });
  }

  const value = "Hello SkillUp 👋"; // This mimics data from DB or computation
  await redisClient.set(key, value, { EX: 30 }); // Cache for 30 seconds
  res.json({ source: "server", data: value });
});

module.exports = router;

