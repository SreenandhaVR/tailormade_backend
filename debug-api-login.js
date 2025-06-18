const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function debugApiLogin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tailormade');
    console.log('Connected to MongoDB');

    const email = 'sreenandhavr@gmail.com';
    const password = 'password123';

    console.log('Testing with email:', email);
    console.log('Testing with password:', password);

    // Step 1: Check if user exists (same as API)
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', !!user);
    
    if (user) {
      console.log('User email in DB:', user.email);
      console.log('User has password field:', !!user.password);
      
      // Step 2: Check password match (same as API)
      const isMatch = await user.matchPassword(password);
      console.log('Password match:', isMatch);
      
      if (isMatch) {
        console.log('✅ Login would be successful!');
        const token = user.getSignedJwtToken();
        console.log('Token:', token);
      } else {
        console.log('❌ Password does not match');
      }
    } else {
      console.log('❌ User not found');
      
      // Let's check what users exist
      const allUsers = await User.find({});
      console.log('All users in DB:');
      allUsers.forEach(u => console.log('-', u.email));
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

debugApiLogin(); 