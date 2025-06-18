const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    // Use local MongoDB if no URI is provided
    const mongoUri = config.mongoUri || 'mongodb://localhost:27017/tailormade_db';
    
    console.log('Connecting to MongoDB...');
    console.log('URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    
    // If it's a local connection error, provide helpful message
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      console.error('\n⚠️  MongoDB is not running or not accessible.');
      console.error('Please make sure MongoDB is installed and running on your system.');
      console.error('For local development, you can:');
      console.error('1. Install MongoDB Community Edition');
      console.error('2. Start MongoDB service');
      console.error('3. Or use MongoDB Atlas by setting MONGODB_URI in your .env file');
      console.error('\nTo install MongoDB on Windows:');
      console.error('1. Download from: https://www.mongodb.com/try/download/community');
      console.error('2. Install and start the MongoDB service');
      console.error('3. Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB; 