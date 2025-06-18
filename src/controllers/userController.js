const User = require('../models/User');
const Shop = require('../models/Shop');
const ErrorResponse = require('../utils/errorResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const { 
  successResponse, 
  createdResponse, 
  paginatedResponse 
} = require('../utils/responseHelper');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  successResponse(res, { user }, 'Profile retrieved successfully');
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  // Handle profile image upload
  if (req.file) {
    req.body.profileImage = req.file.path;
  }

  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true
  });

  successResponse(res, { user }, 'Profile updated successfully');
});

// @desc    Delete user profile
// @route   DELETE /api/users/profile
// @access  Private
const deleteProfile = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);
  successResponse(res, {}, 'Profile deleted successfully');
});

// @desc    Upload profile image
// @route   POST /api/users/profile/upload-image
// @access  Private
const uploadProfileImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { profileImage: req.file.path },
    { new: true }
  );

  successResponse(res, { profileImage: user.profileImage }, 'Profile image uploaded successfully');
});

// @desc    Get user preferences
// @route   GET /api/users/preferences
// @access  Private
const getPreferences = asyncHandler(async (req, res, next) => {
  // This would typically come from a separate preferences collection
  // For now, we'll return default preferences
  const preferences = {
    notifications: {
      email: true,
      sms: true,
      push: false
    },
    language: 'en',
    currency: 'NGN',
    timezone: 'Africa/Lagos'
  };

  successResponse(res, { preferences }, 'Preferences retrieved successfully');
});

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
const updatePreferences = asyncHandler(async (req, res, next) => {
  // This would typically update a separate preferences collection
  // For now, we'll just return success
  successResponse(res, {}, 'Preferences updated successfully');
});

// @desc    Get user measurements
// @route   GET /api/users/measurements
// @access  Private
const getMeasurements = asyncHandler(async (req, res, next) => {
  // This would typically come from a separate measurements collection
  // For now, we'll return empty measurements
  const measurements = {
    chest: null,
    waist: null,
    hips: null,
    shoulder: null,
    sleeve: null,
    neck: null,
    length: null,
    inseam: null,
    custom: []
  };

  successResponse(res, { measurements }, 'Measurements retrieved successfully');
});

// @desc    Update user measurements
// @route   PUT /api/users/measurements
// @access  Private
const updateMeasurements = asyncHandler(async (req, res, next) => {
  // This would typically update a separate measurements collection
  // For now, we'll just return success
  successResponse(res, {}, 'Measurements updated successfully');
});

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res, next) => {
  // This would typically come from a separate favorites collection
  // For now, we'll return empty array
  successResponse(res, { favorites: [] }, 'Favorites retrieved successfully');
});

// @desc    Add shop to favorites
// @route   POST /api/users/favorites/:shopId
// @access  Private
const addToFavorites = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findById(req.params.shopId);
  
  if (!shop) {
    return next(new ErrorResponse('Shop not found', 404));
  }

  // This would typically add to a separate favorites collection
  // For now, we'll just return success
  successResponse(res, {}, 'Shop added to favorites');
});

// @desc    Remove shop from favorites
// @route   DELETE /api/users/favorites/:shopId
// @access  Private
const removeFromFavorites = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findById(req.params.shopId);
  
  if (!shop) {
    return next(new ErrorResponse('Shop not found', 404));
  }

  // This would typically remove from a separate favorites collection
  // For now, we'll just return success
  successResponse(res, {}, 'Shop removed from favorites');
});

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res, next) => {
  // This would typically come from a separate notifications collection
  // For now, we'll return empty array
  successResponse(res, { notifications: [] }, 'Notifications retrieved successfully');
});

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
const markNotificationRead = asyncHandler(async (req, res, next) => {
  // This would typically update a separate notifications collection
  // For now, we'll just return success
  successResponse(res, {}, 'Notification marked as read');
});

// @desc    Mark all notifications as read
// @route   PUT /api/users/notifications/read-all
// @access  Private
const markAllNotificationsRead = asyncHandler(async (req, res, next) => {
  // This would typically update a separate notifications collection
  // For now, we'll just return success
  successResponse(res, {}, 'All notifications marked as read');
});

// @desc    Get all users (Admin)
// @route   GET /api/users/admin/all
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const total = await User.countDocuments();
  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  paginatedResponse(res, users, page, limit, total, 'Users retrieved successfully');
});

// @desc    Get user by ID (Admin)
// @route   GET /api/users/admin/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  successResponse(res, { user }, 'User retrieved successfully');
});

// @desc    Update user (Admin)
// @route   PUT /api/users/admin/:id
// @access  Private/Admin
const adminUpdateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  successResponse(res, { user }, 'User updated successfully');
});

// @desc    Delete user (Admin)
// @route   DELETE /api/users/admin/:id
// @access  Private/Admin
const adminDeleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  await user.remove();

  successResponse(res, {}, 'User deleted successfully');
});

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
  uploadProfileImage,
  getPreferences,
  updatePreferences,
  getMeasurements,
  updateMeasurements,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAllUsers,
  getUserById,
  adminUpdateUser,
  adminDeleteUser
}; 