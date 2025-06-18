const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  expireAt: {
    type: Date,
    default: () => Date.now() + 10 * 60 * 1000, // 10 mins
    index: { expires: 0 }
  }
});

module.exports = mongoose.model('Otp', otpSchema);
