const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { orderValidation, commonValidation } = require('../utils/validators');
const { uploadMultiple } = require('../config/multer');
const orderController = require('../controllers/orderController');

// Customer routes
router.get('/my-orders', 
  protect,
  orderController.getMyOrders
);

router.post('/', 
  protect,
  uploadMultiple,
  orderValidation.create,
  handleValidationErrors,
  orderController.createOrder
);

router.get('/:id', 
  protect,
  commonValidation.id,
  handleValidationErrors,
  orderController.getOrder
);

router.put('/:id/cancel', 
  protect,
  commonValidation.id,
  handleValidationErrors,
  orderController.cancelOrder
);

router.post('/:id/review', 
  protect,
  commonValidation.id,
  handleValidationErrors,
  orderController.addReview
);

// Shop owner routes
router.get('/shop/:shopId', 
  protect,
  authorize('tailor', 'admin'),
  commonValidation.id,
  handleValidationErrors,
  orderController.getShopOrders
);

router.put('/:id/status', 
  protect,
  authorize('tailor', 'admin'),
  commonValidation.id,
  orderValidation.update,
  handleValidationErrors,
  orderController.updateOrderStatus
);

router.put('/:id/payment-status', 
  protect,
  authorize('tailor', 'admin'),
  commonValidation.id,
  orderValidation.update,
  handleValidationErrors,
  orderController.updatePaymentStatus
);

router.post('/:id/images', 
  protect,
  authorize('tailor', 'admin'),
  commonValidation.id,
  uploadMultiple,
  orderController.uploadOrderImages
);

router.put('/:id/measurements', 
  protect,
  authorize('tailor', 'admin'),
  commonValidation.id,
  orderValidation.measurements,
  handleValidationErrors,
  orderController.updateMeasurements
);

router.put('/:id/estimated-completion', 
  protect,
  authorize('tailor', 'admin'),
  commonValidation.id,
  handleValidationErrors,
  orderController.updateEstimatedCompletion
);

// Admin routes
router.get('/admin/all', 
  protect,
  authorize('admin'),
  orderController.getAllOrders
);

router.get('/admin/stats', 
  protect,
  authorize('admin'),
  orderController.getOrderStats
);

router.put('/:id/admin-update', 
  protect,
  authorize('admin'),
  commonValidation.id,
  orderValidation.update,
  handleValidationErrors,
  orderController.adminUpdateOrder
);

module.exports = router; 