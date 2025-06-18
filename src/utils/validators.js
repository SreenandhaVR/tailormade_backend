const { body, param, query } = require('express-validator');

// User validation schemas
const userValidation = {
  register: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('phone')
      .matches(/^\+?[\d\s-()]+$/)
      .withMessage('Please provide a valid phone number'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['user', 'admin', 'tailor'])
      .withMessage('Invalid role')
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('phone')
      .optional()
      .matches(/^\+?[\d\s-()]+$/)
      .withMessage('Please provide a valid phone number'),
    body('address.street')
      .optional()
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('Street address must be between 5 and 100 characters'),
    body('address.city')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('City must be between 2 and 50 characters'),
    body('address.state')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('State must be between 2 and 50 characters')
  ],

  measurements: [
    body('measurements.chest')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Chest measurement must be positive'),
    body('measurements.waist')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Waist measurement must be positive'),
    body('measurements.hips')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Hips measurement must be positive'),
    body('measurements.shoulder')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Shoulder measurement must be positive'),
    body('measurements.sleeve')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Sleeve measurement must be positive'),
    body('measurements.neck')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Neck measurement must be positive'),
    body('measurements.length')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Length measurement must be positive'),
    body('measurements.inseam')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Inseam measurement must be positive')
  ]
};

// Shop validation schemas
const shopValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Shop name must be between 2 and 100 characters'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Description must be between 10 and 500 characters'),
    body('address.street')
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('Street address must be between 5 and 100 characters'),
    body('address.city')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('City must be between 2 and 50 characters'),
    body('address.state')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('State must be between 2 and 50 characters'),
    body('phone')
      .matches(/^\+?[\d\s-()]+$/)
      .withMessage('Please provide a valid phone number'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('category')
      .isIn(['men', 'women', 'children', 'unisex', 'formal', 'casual', 'traditional'])
      .withMessage('Invalid category'),
    body('specialties')
      .optional()
      .isArray()
      .withMessage('Specialties must be an array'),
    body('specialties.*')
      .optional()
      .isIn(['suits', 'dresses', 'shirts', 'pants', 'skirts', 'traditional', 'bridal', 'casual'])
      .withMessage('Invalid specialty')
  ],

  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Shop name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Description must be between 10 and 500 characters'),
    body('category')
      .optional()
      .isIn(['men', 'women', 'children', 'unisex', 'formal', 'casual', 'traditional'])
      .withMessage('Invalid category')
  ],

  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Search query must be at least 2 characters'),
    query('category')
      .optional()
      .isIn(['men', 'women', 'children', 'unisex', 'formal', 'casual', 'traditional'])
      .withMessage('Invalid category'),
    query('lat')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Invalid latitude'),
    query('lng')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Invalid longitude'),
    query('radius')
      .optional()
      .isFloat({ min: 0.1, max: 100 })
      .withMessage('Radius must be between 0.1 and 100 km')
  ]
};

// Order validation schemas
const orderValidation = {
  create: [
    body('shop')
      .isMongoId()
      .withMessage('Invalid shop ID'),
    body('items')
      .isArray({ min: 1 })
      .withMessage('At least one item is required'),
    body('items.*.name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Item name must be between 2 and 100 characters'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
    body('items.*.price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('items.*.fabric')
      .trim()
      .notEmpty()
      .withMessage('Fabric is required'),
    body('paymentMethod')
      .isIn(['cash', 'card', 'bank_transfer', 'mobile_money'])
      .withMessage('Invalid payment method'),
    body('deliveryOption')
      .optional()
      .isIn(['pickup', 'delivery'])
      .withMessage('Invalid delivery option')
  ],

  update: [
    body('status')
      .optional()
      .isIn(['pending', 'confirmed', 'in_progress', 'ready_for_fitting', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
    body('paymentStatus')
      .optional()
      .isIn(['pending', 'partial', 'paid', 'refunded'])
      .withMessage('Invalid payment status')
  ],

  measurements: [
    body('measurements.chest')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Chest measurement must be positive'),
    body('measurements.waist')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Waist measurement must be positive'),
    body('measurements.hips')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Hips measurement must be positive'),
    body('measurements.shoulder')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Shoulder measurement must be positive'),
    body('measurements.sleeve')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Sleeve measurement must be positive'),
    body('measurements.neck')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Neck measurement must be positive'),
    body('measurements.length')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Length measurement must be positive'),
    body('measurements.inseam')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Inseam measurement must be positive')
  ]
};

// About validation schemas
const aboutValidation = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Title must be between 2 and 100 characters'),
    body('content')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Content must be at least 10 characters'),
    body('type')
      .isIn(['about', 'privacy', 'terms', 'contact', 'faq', 'help'])
      .withMessage('Invalid type'),
    body('slug')
      .trim()
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug must contain only lowercase letters, numbers, and hyphens')
  ],

  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Title must be between 2 and 100 characters'),
    body('content')
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage('Content must be at least 10 characters')
  ]
};

// Common validation schemas
const commonValidation = {
  id: [
    param('id')
      .isMongoId()
      .withMessage('Invalid ID format')
  ],

  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ]
};

module.exports = {
  userValidation,
  shopValidation,
  orderValidation,
  aboutValidation,
  commonValidation
}; 