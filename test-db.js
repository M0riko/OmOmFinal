require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

async function testConnection() {
  console.log("Testing MongoDB connection...");
  console.log("URI:", process.env.MONGO_URI ? "Found" : "Missing");
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // fail fast
    });
    console.log("SUCCESS! Connected to MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("CONNECTION FAILED:", error.message);
    process.exit(1);
  }
}

testConnection();
