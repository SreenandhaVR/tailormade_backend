const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function listUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tailormade');
    console.log('Connected to MongoDB');

    // Find all users
    const users = await User.find({});
    
    console.log('Total users found:', users.length);
    
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log('ID:', user._id);
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Phone:', user.phone);
      console.log('Role:', user.role);
      console.log('Is Verified:', user.isVerified);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

listUsers(); 