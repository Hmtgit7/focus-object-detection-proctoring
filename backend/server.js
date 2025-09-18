// Load environment variables
require('dotenv').config();

const app = require("./src/app.js");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./src/config/database");
const { initializeSocketService } = require("./src/services/socketService");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize socket service
initializeSocketService(io);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 MongoDB: ${process.env.MONGODB_URI}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("❌ UNHANDLED PROMISE REJECTION! Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
