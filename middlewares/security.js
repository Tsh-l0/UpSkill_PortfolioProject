const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

// Rate limiting configurations
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limits for different endpoints
const authLimiter = createRateLimiter(
  1 * 60 * 1000, // 1 minutes
  5, // limit each IP to 5 requests per windowMs
  "Too many authentication attempts from this IP, please try again after 15 minutes"
);

const apiLimiter = createRateLimiter(
  1 * 60 * 1000, // 1 minutes
  100, // limit each IP to 100 requests per windowMs
  "Too many API requests from this IP, please try again after 15 minutes"
);

const endorsementLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // limit each IP to 10 endorsements per hour
  "Too many endorsements from this IP, please try again after an hour"
);

// Security middleware stack
const securityMiddleware = [
  // Basic security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        scriptSrc: ["'self'"],
      },
    },
  }),

  // Data sanitization
  mongoSanitize(), // Prevent NoSQL injection
  xss(), // Clean user input from malicious HTML
  hpp(), // Prevent HTTP Parameter Pollution

  // Apply general API rate limiting
  apiLimiter,
];

module.exports = {
  securityMiddleware,
  authLimiter,
  endorsementLimiter,
};
