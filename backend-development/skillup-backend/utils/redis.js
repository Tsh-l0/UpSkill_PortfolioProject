import { createClient } from "redis";

const redisClient = createClient();

redisClient.on("error", (err) =>
  console.error("❌ Redis connection error:", err)
);

await redisClient.connect();

console.log("✅ Redis connected");

export default redisClient;

