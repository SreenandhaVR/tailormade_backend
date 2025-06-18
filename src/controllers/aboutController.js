const About = require('../models/About');
const ErrorResponse = require('../utils/errorResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const { 
  successResponse, 
  createdResponse, 
  paginatedResponse 
} = require('../utils/responseHelper');

// @desc    Get all content
// @route   GET /api/about
// @access  Public
const getAllContent = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const query = { isPublished: true };

  const total = await About.countDocuments(query);
  const content = await About.find(query)
    .populate('author', 'name')
    .populate('lastModifiedBy', 'name')
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  paginatedResponse(res, content, page, limit, total, 'Content retrieved successfully');
});

// @desc    Get content by slug
// @route   GET /api/about/:slug
// @access  Public
const getContentBySlug = asyncHandler(async (req, res, next) => {
  const content = await About.findOne({ 
    slug: req.params.slug,
    isPublished: true 
  }).populate('author', 'name')
    .populate('lastModifiedBy', 'name');

  if (!content) {
    return next(new ErrorResponse('Content not found', 404));
  }

  successResponse(res, { content }, 'Content retrieved successfully');
});

// @desc    Get content by type
// @route   GET /api/about/type/:type
// @access  Public
const getContentByType = asyncHandler(async (req, res, next) => {
  const { type } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const query = { 
    type: type,
    isPublished: true 
  };

  const total = await About.countDocuments(query);
  const content = await About.find(query)
    .populate('author', 'name')
    .populate('lastModifiedBy', 'name')
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  paginatedResponse(res, content, page, limit, total, 'Content retrieved successfully');
});

// @desc    Create content
// @route   POST /api/about
// @access  Private/Admin
const createContent = asyncHandler(async (req, res, next) => {
  // Add author to request body
  req.body.author = req.user.id;
  req.body.lastModifiedBy = req.user.id;

  const content = await About.create(req.body);

  await content.populate('author', 'name');
  await content.populate('lastModifiedBy', 'name');

  createdResponse(res, { content }, 'Content created successfully');
});

// @desc    Update content
// @route   PUT /api/about/:id
// @access  Private/Admin
const updateContent = asyncHandler(async (req, res, next) => {
  // Add last modified by to request body
  req.body.lastModifiedBy = req.user.id;
  req.body.version = { $inc: 1 };

  const content = await About.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('author', 'name')
   .populate('lastModifiedBy', 'name');

  if (!content) {
    return next(new ErrorResponse('Content not found', 404));
  }

  successResponse(res, { content }, 'Content updated successfully');
});

// @desc    Delete content
// @route   DELETE /api/about/:id
// @access  Private/Admin
const deleteContent = asyncHandler(async (req, res, next) => {
  const content = await About.findById(req.params.id);

  if (!content) {
    return next(new ErrorResponse('Content not found', 404));
  }

  await content.remove();

  successResponse(res, {}, 'Content deleted successfully');
});

// @desc    Publish content
// @route   PUT /api/about/:id/publish
// @access  Private/Admin
const publishContent = asyncHandler(async (req, res, next) => {
  const content = await About.findByIdAndUpdate(
    req.params.id,
    { 
      isPublished: true,
      lastModifiedBy: req.user.id
    },
    { new: true, runValidators: true }
  ).populate('author', 'name')
   .populate('lastModifiedBy', 'name');

  if (!content) {
    return next(new ErrorResponse('Content not found', 404));
  }

  successResponse(res, { content }, 'Content published successfully');
});

// @desc    Unpublish content
// @route   PUT /api/about/:id/unpublish
// @access  Private/Admin
const unpublishContent = asyncHandler(async (req, res, next) => {
  const content = await About.findByIdAndUpdate(
    req.params.id,
    { 
      isPublished: false,
      lastModifiedBy: req.user.id
    },
    { new: true, runValidators: true }
  ).populate('author', 'name')
   .populate('lastModifiedBy', 'name');

  if (!content) {
    return next(new ErrorResponse('Content not found', 404));
  }

  successResponse(res, { content }, 'Content unpublished successfully');
});

module.exports = {
  getAllContent,
  getContentBySlug,
  getContentByType,
  createContent,
  updateContent,
  deleteContent,
  publishContent,
  unpublishContent
}; 