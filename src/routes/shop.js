const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { shopValidation, commonValidation } = require('../utils/validators');
const { uploadFields } = require('../config/multer');
const shopController = require('../controllers/shopController');

// Public routes
router.get('/', 
  optionalAuth,
  shopValidation.search,
  handleValidationErrors,
  shopController.getShops
);

router.get('/search', 
  optionalAuth,
  shopValidation.search,
  handleValidationErrors,
  shopController.searchShops
);

router.get('/:id', 
  optionalAuth,
  commonValidation.id,
  handleValidationErrors,
  shopController.getShop
);

router.get('/:id/reviews', 
  commonValidation.id,
  handleValidationErrors,
  shopController.getShopReviews
);

// Protected routes (shop owners and admins)
router.post('/', 
  protect, 
  authorize('tailor', 'admin'),
  uploadFields,
  shopValidation.create,
  handleValidationErrors,
  shopController.createShop
);

router.put('/:id', 
  protect,
  commonValidation.id,
  uploadFields,
  shopValidation.update,
  handleValidationErrors,
  shopController.updateShop
);

router.delete('/:id', 
  protect,
  commonValidation.id,
  handleValidationErrors,
  shopController.deleteShop
);

router.post('/:id/images', 
  protect,
  commonValidation.id,
  uploadFields,
  shopController.uploadImages
);

router.delete('/:id/images/:imageId', 
  protect,
  commonValidation.id,
  handleValidationErrors,
  shopController.deleteImage
);

// Shop owner specific routes
router.put('/:id/working-hours', 
  protect,
  commonValidation.id,
  handleValidationErrors,
  shopController.updateWorkingHours
);

router.put('/:id/status', 
  protect,
  commonValidation.id,
  handleValidationErrors,
  shopController.updateStatus
);

// Admin only routes
router.put('/:id/verify', 
  protect,
  authorize('admin'),
  commonValidation.id,
  handleValidationErrors,
  shopController.verifyShop
);

router.get('/admin/all', 
  protect,
  authorize('admin'),
  shopController.getAllShops
);

module.exports = router; 