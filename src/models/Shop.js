const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a shop name'],
    trim: true,
    maxlength: [100, 'Shop name cannot be more than 100 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please provide street address']
    },
    city: {
      type: String,
      required: [true, 'Please provide city']
    },
    state: {
      type: String,
      required: [true, 'Please provide state']
    },
    zipCode: String,
    country: {
      type: String,
      default: 'Nigeria'
    }
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  images: [{
    type: String
  }],
  logo: String,
  category: {
    type: String,
    enum: ['men', 'women', 'children', 'unisex', 'formal', 'casual', 'traditional'],
    required: true
  },
  specialties: [{
    type: String,
    enum: ['suits', 'dresses', 'shirts', 'pants', 'skirts', 'traditional', 'bridal', 'casual']
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  workingHours: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geospatial queries
shopSchema.index({ location: '2dsphere' });

// Index for search functionality
shopSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Shop', shopSchema); 