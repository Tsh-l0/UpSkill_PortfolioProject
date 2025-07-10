//auth.middleware.js

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach the decoded user payload to the request object
    next();
  } catch (err) {
    res.status(403).json({ msg: "Invalid or expired token" });
  }
};

module.exports = { verifyToken };

