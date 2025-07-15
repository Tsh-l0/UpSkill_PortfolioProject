const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection options for optimal performance
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering

      // Additional optimizations
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      compressors: "zlib", // Enable compression
    });

    // Connection event handlers
    mongoose.connection.on("connected", () => {
      console.log("MongoDB Connected:", conn.connection.host);
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB Error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB Disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed through app termination");
        process.exit(0);
      } catch (error) {
        console.error("Error during MongoDB shutdown:", error);
        process.exit(1);
      }
    });

    return conn;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

// Health check function
const checkDBHealth = async () => {
  try {
    await mongoose.connection.db.admin().ping();
    return {
      status: "healthy",
      connected: mongoose.connection.readyState === 1,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      connected: false,
      error: error.message,
    };
  }
};

module.exports = {
  connectDB,
  checkDBHealth,
};