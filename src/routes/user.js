const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { userValidation, commonValidation } = require('../utils/validators');
const { uploadSingle } = require('../config/multer');
const userController = require('../controllers/userController');

// User profile routes
router.get('/profile', 
  protect,
  userController.getProfile
);

router.put('/profile', 
  protect,
  uploadSingle,
  userValidation.updateProfile,
  handleValidationErrors,
  userController.updateProfile
);

router.delete('/profile', 
  protect,
  userController.deleteProfile
);

router.post('/profile/upload-image', 
  protect,
  uploadSingle,
  userController.uploadProfileImage
);

// User preferences and settings
router.get('/preferences', 
  protect,
  userController.getPreferences
);

router.put('/preferences', 
  protect,
  userController.updatePreferences
);

// User measurements
router.get('/measurements', 
  protect,
  userController.getMeasurements
);

router.put('/measurements', 
  protect,
  userValidation.measurements,
  handleValidationErrors,
  userController.updateMeasurements
);

// User favorites
router.get('/favorites', 
  protect,
  userController.getFavorites
);

router.post('/favorites/:shopId', 
  protect,
  commonValidation.id,
  handleValidationErrors,
  userController.addToFavorites
);

router.delete('/favorites/:shopId', 
  protect,
  commonValidation.id,
  handleValidationErrors,
  userController.removeFromFavorites
);

// User notifications
router.get('/notifications', 
  protect,
  userController.getNotifications
);

router.put('/notifications/:id/read', 
  protect,
  commonValidation.id,
  handleValidationErrors,
  userController.markNotificationRead
);

router.put('/notifications/read-all', 
  protect,
  userController.markAllNotificationsRead
);

// Admin routes
router.get('/admin/all', 
  protect,
  authorize('admin'),
  userController.getAllUsers
);

router.get('/admin/:id', 
  protect,
  authorize('admin'),
  commonValidation.id,
  handleValidationErrors,
  userController.getUserById
);

router.put('/admin/:id', 
  protect,
  authorize('admin'),
  commonValidation.id,
  userValidation.updateProfile,
  handleValidationErrors,
  userController.adminUpdateUser
);

router.delete('/admin/:id', 
  protect,
  authorize('admin'),
  commonValidation.id,
  handleValidationErrors,
  userController.adminDeleteUser
);

module.exports = router; 