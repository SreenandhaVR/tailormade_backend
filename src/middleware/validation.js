const { validationResult } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Custom validation for phone numbers
const isValidPhoneNumber = (value) => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(value);
};

// Custom validation for Nigerian phone numbers
const isValidNigerianPhone = (value) => {
  const nigerianPhoneRegex = /^(\+234|0)[789][01]\d{8}$/;
  return nigerianPhoneRegex.test(value.replace(/\s/g, ''));
};

// Custom validation for ObjectId
const isValidObjectId = (value) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(value);
};

// Custom validation for coordinates
const isValidCoordinates = (value) => {
  if (!Array.isArray(value) || value.length !== 2) {
    return false;
  }
  
  const [longitude, latitude] = value;
  return (
    typeof longitude === 'number' && 
    typeof latitude === 'number' &&
    longitude >= -180 && longitude <= 180 &&
    latitude >= -90 && latitude <= 90
  );
};

// Custom validation for file size
const isValidFileSize = (file, maxSize) => {
  return file && file.size <= maxSize;
};

// Custom validation for file type
const isValidFileType = (file, allowedTypes) => {
  if (!file) return false;
  
  const fileExtension = file.originalname.split('.').pop().toLowerCase();
  const mimeType = file.mimetype;
  
  return allowedTypes.some(type => {
    if (typeof type === 'string') {
      return fileExtension === type || mimeType.includes(type);
    }
    return false;
  });
};

// Middleware to validate request using express-validator
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new ErrorResponse(errorMessages.join(', '), 400));
  }
  
  next();
};

module.exports = {
  handleValidationErrors,
  isValidPhoneNumber,
  isValidNigerianPhone,
  isValidObjectId,
  isValidCoordinates,
  isValidFileSize,
  isValidFileType,
  validateRequest
}; 