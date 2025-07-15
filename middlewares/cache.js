const { cacheHelper } = require("../config/redis");

const cache = (duration = 3600) => {
  return async (req, res, next) => {
    // Generate cache key based on route and query params
    const key = `${req.originalUrl}_${JSON.stringify(req.query)}`;

    try {
      const cachedData = await cacheHelper.get(key);

      if (cachedData) {
        return res.json({
          success: true,
          data: cachedData,
          cached: true,
        });
      }

      // Store original res.json
      const originalJson = res.json;

      // Override res.json to cache the response
      res.json = function (data) {
        // Cache successful responses only
        if (data.success) {
          cacheHelper.set(key, data, duration);
        }

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
};

module.exports = cache;
