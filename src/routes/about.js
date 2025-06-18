const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { aboutValidation, commonValidation } = require('../utils/validators');
const aboutController = require('../controllers/aboutController');

// Public routes
router.get('/', 
  aboutController.getAllContent
);

router.get('/:slug', 
  aboutController.getContentBySlug
);

router.get('/type/:type', 
  aboutController.getContentByType
);

// Admin routes
router.post('/', 
  protect,
  authorize('admin'),
  aboutValidation.create,
  handleValidationErrors,
  aboutController.createContent
);

router.put('/:id', 
  protect,
  authorize('admin'),
  commonValidation.id,
  aboutValidation.update,
  handleValidationErrors,
  aboutController.updateContent
);

router.delete('/:id', 
  protect,
  authorize('admin'),
  commonValidation.id,
  handleValidationErrors,
  aboutController.deleteContent
);

router.put('/:id/publish', 
  protect,
  authorize('admin'),
  commonValidation.id,
  handleValidationErrors,
  aboutController.publishContent
);

router.put('/:id/unpublish', 
  protect,
  authorize('admin'),
  commonValidation.id,
  handleValidationErrors,
  aboutController.unpublishContent
);

module.exports = router; 