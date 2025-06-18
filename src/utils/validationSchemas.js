const { body } = require('express-validator');

// Login validation schema
const loginValidation = [
  body('phone')
    .isLength({ min: 10, max: 10 })
    .withMessage('Phone number must be exactly 10 digits')
    .isNumeric()
    .withMessage('Phone number must contain only numbers'),
  body('deviceToken')
    .optional()
    .isString()
    .withMessage('Device token must be a string'),
  body('deviceType')
    .optional()
    .isInt({ min: 1, max: 2 })
    .withMessage('Device type must be 1 (Android) or 2 (iOS)')
];

// OTP verification validation schema
const otpVerificationValidation = [
  body('phone')
    .isLength({ min: 10, max: 10 })
    .withMessage('Phone number must be exactly 10 digits')
    .isNumeric()
    .withMessage('Phone number must contain only numbers'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers')
];

// Email login validation schema
const emailLoginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Registration validation schema
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 25 })
    .withMessage('First name must be between 1 and 25 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 25 })
    .withMessage('Last name must be between 1 and 25 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .isLength({ min: 10, max: 10 })
    .withMessage('Phone number must be exactly 10 digits')
    .isNumeric()
    .withMessage('Phone number must contain only numbers'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('deviceToken')
    .optional()
    .isString()
    .withMessage('Device token must be a string'),
  body('deviceType')
    .optional()
    .isInt({ min: 1, max: 2 })
    .withMessage('Device type must be 1 (Android) or 2 (iOS)')
];

// Password update validation schema
const updatePasswordValidation = [
  body('currentPassword')
    .isLength({ min: 6 })
    .withMessage('Current password must be at least 6 characters long'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Forgot password validation schema
const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
];

// Reset password validation schema
const resetPasswordValidation = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// User profile update validation schema
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 10 })
    .withMessage('Phone number must be exactly 10 digits')
    .isNumeric()
    .withMessage('Phone number must contain only numbers'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City name cannot exceed 50 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State name cannot exceed 50 characters'),
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Zip code cannot exceed 10 characters')
];

module.exports = {
  loginValidation,
  otpVerificationValidation,
  emailLoginValidation,
  registerValidation,
  updatePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation
}; 