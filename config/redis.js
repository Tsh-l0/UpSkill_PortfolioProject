const redis = require("redis");

let redisClient;

const connectRedis = async () => {
  try {
    if (!process.env.REDIS_URL) {
      console.log('⚠️ REDIS_URL not provided, skipping Redis connection');
      return null;
    }

    console.log('🔌 Attempting Redis connection to:', process.env.REDIS_URL.replace(/:[^:]*@/, ':***@'));

    // Create Redis client with Upstash URL
    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.error('❌ Redis max reconnection attempts reached');
            return false;
          }
          console.log(`🔄 Redis reconnection attempt ${retries}`);
          return Math.min(retries * 100, 3000);
        },
        connectTimeout: 10000,
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      console.log("Redis Connected");
    });

    redisClient.on("reconnecting", () => {
      console.log("Redis Reconnecting...");
    });

    redisClient.on("ready", () => {
      console.log("Redis Ready");
    });

    await redisClient.connect();

    // Test the connection
    await redisClient.ping();
    console.log('Redis connection successful');

    return redisClient;
  } catch (error) {
    console.error("Redis connection failed:", error);
    // Don't exit process, allow app to run without Redis
    return null;
  }
};

// Cache Helper Functions with error handling
const cacheHelper = {
  // Set cache with TTL
  set: async (key, value, ttl = 3600) => {
    try {
      if (!redisClient?.isReady) return false;
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  },

  // Get from cache
  get: async (key) => {
    try {
      if (!redisClient?.isReady) return null;
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  },

  // Delete from cache
  del: async (key) => {
    try {
      if (!redisClient?.isReady) return false;
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error("Cache delete error:", error);
      return false;
    }
  },

  // Clear pattern
  clearPattern: async (pattern) => {
    try {
      if (!redisClient?.isReady) return false;
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      console.error("Cache clear pattern error:", error);
      return false;
    }
  },

  // Increment counter
  incr: async (key, ttl = 3600) => {
    try {
      if (!redisClient?.isReady) return 0;
      const result = await redisClient.incr(key);
      if (result === 1) {
        await redisClient.expire(key, ttl);
      }
      return result;
    } catch (error) {
      console.error("Cache increment error:", error);
      return 0;
    }
  },

  // Check if key exists
  exists: async (key) => {
    try {
      if (!redisClient?.isReady) return false;
      return (await redisClient.exists(key)) === 1;
    } catch (error) {
      console.error("Cache exists error:", error);
      return false;
    }
  },

  // Set with expiration
  setex: async (key, ttl, value) => {
    try {
      if (!redisClient?.isReady) return false;
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Cache setex error:", error);
      return false;
    }
  },

  // Add to set
  sadd: async (key, member) => {
    try {
      if (!redisClient?.isReady) return false;
      await redisClient.sAdd(key, member);
      return true;
    } catch (error) {
      console.error("Cache sadd error:", error);
      return false;
    }
  },

  // Check if member in set
  sismember: async (key, member) => {
    try {
      if (!redisClient?.isReady) return false;
      return await redisClient.sIsMember(key, member);
    } catch (error) {
      console.error("Cache sismember error:", error);
      return false;
    }
  },
};

// Cache key generators
const cacheKeys = {
  userProfile: (userId) => `user:profile:${userId}`,
  userSkills: (userId) => `user:skills:${userId}`,
  skillsList: (category = "all") => `skills:list:${category}`,
  trendingSkills: () => "skills:trending",
  blogPosts: (category, page) => `blog:posts:${category}:${page}`,
  dashboardAnalytics: (userId) => `analytics:dashboard:${userId}`,
  userConnections: (userId) => `user:connections:${userId}`,
  endorsementStats: (userId) => `endorsements:stats:${userId}`,
  searchResults: (query, type) =>
    `search:${type}:${Buffer.from(query).toString("base64")}`,
  rateLimitAuth: (ip) => `rate_limit:auth:${ip}`,
  rateLimitApi: (ip) => `rate_limit:api:${ip}`,
  sessionUser: (sessionId) => `session:user:${sessionId}`,
  blacklistedToken: (token) => `blacklist:${token}`,
};

module.exports = {
  connectRedis,
  redisClient,
  cacheHelper,
  cacheKeys,
};
