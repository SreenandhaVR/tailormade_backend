const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function checkEmailCase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tailormade');
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: { $regex: /sreenandhavr@gmail.com/i } });
    
    if (user) {
      console.log('Found user with email:', user.email);
      console.log('Email length:', user.email.length);
      console.log('Email bytes:', Buffer.from(user.email).toString('hex'));
      console.log('Full user object:', JSON.stringify(user, null, 2));
    } else {
      console.log('No user found');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkEmailCase(); 