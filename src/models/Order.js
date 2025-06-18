const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    measurements: {
      chest: Number,
      waist: Number,
      hips: Number,
      shoulder: Number,
      sleeve: Number,
      neck: Number,
      length: Number,
      inseam: Number,
      custom: [{
        name: String,
        value: Number,
        unit: String
      }]
    },
    fabric: {
      type: String,
      required: true
    },
    color: String,
    style: String,
    additionalNotes: String
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'ready_for_fitting', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'mobile_money'],
    required: true
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Nigeria'
    }
  },
  deliveryOption: {
    type: String,
    enum: ['pickup', 'delivery'],
    default: 'pickup'
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  scheduledDate: Date,
  estimatedCompletion: Date,
  actualCompletion: Date,
  images: [{
    type: String,
    description: String
  }],
  documents: [{
    type: String,
    name: String
  }],
  notes: {
    customer: String,
    tailor: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String,
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

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `TM${year}${month}${day}${random}`;
  }
  next();
});

// Index for efficient queries
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ shop: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema); 