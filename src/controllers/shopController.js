const Shop = require('../models/Shop');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const { 
  successResponse, 
  createdResponse, 
  paginatedResponse,
  notFoundResponse 
} = require('../utils/responseHelper');

// @desc    Get all shops
// @route   GET /api/shops
// @access  Public
const getShops = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const query = { isActive: true };

  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Filter by verified shops
  if (req.query.verified === 'true') {
    query.isVerified = true;
  }

  const total = await Shop.countDocuments(query);
  const shops = await Shop.find(query)
    .populate('owner', 'name email phone')
    .sort({ rating: -1, createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  paginatedResponse(res, shops, page, limit, total, 'Shops retrieved successfully');
});

// @desc    Search shops
// @route   GET /api/shops/search
// @access  Public
const searchShops = asyncHandler(async (req, res, next) => {
  const { q, category, lat, lng, radius = 10 } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const query = { isActive: true };

  // Text search
  if (q) {
    query.$text = { $search: q };
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Geospatial search
  if (lat && lng) {
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: radius * 1000 // Convert km to meters
      }
    };
  }

  const total = await Shop.countDocuments(query);
  const shops = await Shop.find(query)
    .populate('owner', 'name email phone')
    .sort({ rating: -1, createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  paginatedResponse(res, shops, page, limit, total, 'Search results');
});

// @desc    Get single shop
// @route   GET /api/shops/:id
// @access  Public
const getShop = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id)
    .populate('owner', 'name email phone');

  if (!shop) {
    return next(new ErrorResponse('Shop not found', 404));
  }

  successResponse(res, { shop }, 'Shop retrieved successfully');
});

// @desc    Create shop
// @route   POST /api/shops
// @access  Private
const createShop = asyncHandler(async (req, res, next) => {
  // Add owner to request body
  req.body.owner = req.user.id;

  // Handle file uploads
  if (req.files) {
    if (req.files.image) {
      req.body.logo = req.files.image[0].path;
    }
    if (req.files.documents) {
      req.body.images = req.files.documents.map(file => file.path);
    }
  }

  // Set location if coordinates provided
  if (req.body.longitude && req.body.latitude) {
    req.body.location = {
      type: 'Point',
      coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
    };
  }

  const shop = await Shop.create(req.body);

  createdResponse(res, { shop }, 'Shop created successfully');
});

// @desc    Update shop
// @route   PUT /api/shops/:id
// @access  Private
const updateShop = asyncHandler(async (req, res, next) => {
  let shop = await Shop.findById(req.params.id);

  if (!shop) {
    return next(new ErrorResponse('Shop not found', 404));
  }

  // Make sure user is shop owner or admin
  if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this shop', 401));
  }

  // Handle file uploads
  if (req.files) {
    if (req.files.image) {
      req.body.logo = req.files.image[0].path;
    }
    if (req.files.documents) {
      req.body.images = req.files.documents.map(file => file.path);
    }
  }

  // Set location if coordinates provided
  if (req.body.longitude && req.body.latitude) {
    req.body.location = {
      type: 'Point',
      coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
    };
  }

  shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  successResponse(res, { shop }, 'Shop updated successfully');
});

// @desc    Delete shop
// @route   DELETE /api/shops/:id
// @access  Private
const deleteShop = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop) {
    return next(new ErrorResponse('Shop not found', 404));
  }

  // Make sure user is shop owner or admin
  if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this shop', 401));
  }

  await shop.remove();

  successResponse(res, {}, 'Shop deleted successfully');
});

// @desc    Upload shop images
// @route   POST /api/shops/:id/images
// @access  Private
const uploadImages = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop) {
    return next(new ErrorResponse('Shop not found', 404));
  }

  // Make sure user is shop owner or admin
  if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to upload images', 401));
  }

  if (!req.files || !req.files.documents) {
    return next(new ErrorResponse('Please upload files', 400));
  }

  const newImages = req.files.documents.map(file => file.path);
  shop.images = [...shop.images, ...newImages];
  await shop.save();

  successResponse(res, { images: shop.images }, 'Images uploaded successfully');
});

// @desc    Delete shop image
// @route   DELETE /api/shops/:id/images/:imageId
// @access  Private
const deleteImage = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop) {
    return next(new ErrorResponse('Shop not found', 404));
  }

  // Make sure user is shop owner or admin
  if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete images', 401));
  }

  const imageIndex = shop.images.indexOf(req.params.imageId);
  if (imageIndex === -1) {
    return next(new ErrorResponse('Image not found', 404));
  }

  shop.images.splice(imageIndex, 1);
  await shop.save();

  successResponse(res, { images: shop.images }, 'Image deleted successfully');
});

// @desc    Update working hours
// @route   PUT /api/shops/:id/working-hours
// @access  Private
const updateWorkingHours = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop) {
    return next(new ErrorResponse('Shop not found', 404));
  }

  // Make sure user is shop owner or admin
  if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update working hours', 401));
  }

  shop.workingHours = req.body.workingHours;
  await shop.save();

  successResponse(res, { workingHours: shop.workingHours }, 'Working hours updated successfully');
});

// @desc    Update shop status
// @route   PUT /api/shops/:id/status
// @access  Private
const updateStatus = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop) {
    return next(new ErrorResponse('Shop not found', 404));
  }

  // Make sure user is shop owner or admin
  if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update status', 401));
  }

  shop.isActive = req.body.isActive;
  await shop.save();

  successResponse(res, { isActive: shop.isActive }, 'Status updated successfully');
});

// @desc    Verify shop (Admin)
// @route   PUT /api/shops/:id/verify
// @access  Private/Admin
const verifyShop = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findByIdAndUpdate(
    req.params.id,
    { isVerified: true },
    { new: true, runValidators: true }
  );

  if (!shop) {
    return next(new ErrorResponse('Shop not found', 404));
  }

  successResponse(res, { shop }, 'Shop verified successfully');
});

// @desc    Get all shops (Admin)
// @route   GET /api/shops/admin/all
// @access  Private/Admin
const getAllShops = asyncHandler(async (req, res, next) => {
  const shops = await Shop.find().populate('owner', 'name email phone');
  successResponse(res, { shops }, 'All shops retrieved successfully');
});

// @desc    Get shop reviews
// @route   GET /api/shops/:id/reviews
// @access  Public
const getShopReviews = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id);
  
  if (!shop) {
    return next(new ErrorResponse('Shop not found', 404));
  }

  // This would typically come from a separate reviews collection
  // For now, we'll return empty array
  successResponse(res, { reviews: [] }, 'Reviews retrieved successfully');
});

module.exports = {
  getShops,
  searchShops,
  getShop,
  createShop,
  updateShop,
  deleteShop,
  uploadImages,
  deleteImage,
  updateWorkingHours,
  updateStatus,
  verifyShop,
  getAllShops,
  getShopReviews
}; 