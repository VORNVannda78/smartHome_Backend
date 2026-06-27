const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌  MONGODB_URI is not set in environment variables!");
    console.error("    → Copy .env.example to .env and fill in your Atlas URI");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      // Recommended options for Atlas
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅  MongoDB connected  →  ${conn.connection.host}`);
  } catch (error) {
    console.error("❌  MongoDB connection failed:", error.message);
    console.error("\n    Common fixes:");
    console.error("    1. Check your MONGODB_URI in .env");
    console.error("    2. Whitelist 0.0.0.0/0 in Atlas Network Access");
    console.error("    3. Confirm username / password are correct\n");
    process.exit(1);
  }
};

// Graceful shutdown on SIGINT / SIGTERM
const shutdown = async (signal) => {
  console.log(`\n${signal} received — closing MongoDB connection...`);
  await mongoose.connection.close();
  console.log("MongoDB connection closed.");
  process.exit(0);
};
process.on("SIGINT",  () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

module.exports = connectDB;
