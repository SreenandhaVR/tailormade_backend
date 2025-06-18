const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide content']
  },
  type: {
    type: String,
    enum: ['about', 'privacy', 'terms', 'contact', 'faq', 'help'],
    required: true
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot be more than 160 characters']
  },
  metaKeywords: [String],
  isPublished: {
    type: Boolean,
    default: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
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

// Index for efficient queries
aboutSchema.index({ type: 1, isPublished: 1 });
aboutSchema.index({ slug: 1 });

module.exports = mongoose.model('About', aboutSchema); 