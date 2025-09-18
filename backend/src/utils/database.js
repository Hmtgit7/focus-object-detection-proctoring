const mongoose = require("mongoose");

// Database connection with retry logic
const connectWithRetry = async (uri, options = {}) => {
  const defaultOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
    bufferMaxEntries: 0,
    ...options,
  };

  try {
    await mongoose.connect(uri, defaultOptions);
    console.log("✅ MongoDB connected successfully");
    return mongoose.connection;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log("🔄 Retrying connection in 5 seconds...");

    setTimeout(() => connectWithRetry(uri, options), 5000);
  }
};

// Check database health
const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    return {
      status: states[state],
      healthy: state === 1,
      timestamp: new Date(),
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  } catch (error) {
    return {
      status: "error",
      healthy: false,
      error: error.message,
      timestamp: new Date(),
    };
  }
};

// Graceful database disconnection
const gracefulDisconnect = async () => {
  try {
    await mongoose.connection.close();
    console.log("📴 MongoDB connection closed gracefully");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
  }
};

// Database seeding utilities
const seedDatabase = async () => {
  try {
    const User = require("../models/User");

    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ email: "admin@proctoring.com" });

    if (!adminExists) {
      await User.create({
        name: "System Administrator",
        email: "admin@proctoring.com",
        password: "Admin@123",
        role: "admin",
      });
      console.log("✅ Admin user created");
    }

    // Create sample interviewer
    const interviewerExists = await User.findOne({
      email: "interviewer@test.com",
    });

    if (!interviewerExists) {
      await User.create({
        name: "Test Interviewer",
        email: "interviewer@test.com",
        password: "Test@123",
        role: "interviewer",
      });
      console.log("✅ Test interviewer created");
    }

    console.log("🌱 Database seeded successfully");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
  }
};

module.exports = {
  connectWithRetry,
  checkDatabaseHealth,
  gracefulDisconnect,
  seedDatabase,
};
