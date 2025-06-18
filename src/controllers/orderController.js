const Order = require('../models/Order');
const Shop = require('../models/Shop');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const { 
  successResponse, 
  createdResponse, 
  paginatedResponse 
} = require('../utils/responseHelper');
const SMSService = require('../utils/smsService');

// @desc    Get my orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const total = await Order.countDocuments({ customer: req.user.id });
  const orders = await Order.find({ customer: req.user.id })
    .populate('shop', 'name phone email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  paginatedResponse(res, orders, page, limit, total, 'Orders retrieved successfully');
});

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res, next) => {
  // Add customer to request body
  req.body.customer = req.user.id;

  // Calculate total amount
  const totalAmount = req.body.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  req.body.totalAmount = totalAmount;

  // Handle file uploads
  if (req.files) {
    req.body.images = req.files.map(file => ({
      type: file.path,
      description: file.originalname
    }));
  }

  const order = await Order.create(req.body);

  // Populate shop details
  await order.populate('shop', 'name phone email');

  // Send confirmation SMS
  const shop = await Shop.findById(req.body.shop);
  if (shop) {
    await SMSService.sendOrderConfirmation(req.user.phone, order.orderNumber, shop.name);
  }

  createdResponse(res, { order }, 'Order created successfully');
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('shop', 'name phone email address');

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Make sure user is the customer, shop owner, or admin
  if (order.customer._id.toString() !== req.user.id && 
      order.shop.owner.toString() !== req.user.id && 
      req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this order', 401));
  }

  successResponse(res, { order }, 'Order retrieved successfully');
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Make sure user is the customer or admin
  if (order.customer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to cancel this order', 401));
  }

  // Check if order can be cancelled
  if (order.status === 'completed' || order.status === 'cancelled') {
    return next(new ErrorResponse('Order cannot be cancelled', 400));
  }

  order.status = 'cancelled';
  await order.save();

  successResponse(res, { order }, 'Order cancelled successfully');
});

// @desc    Add review to order
// @route   POST /api/orders/:id/review
// @access  Private
const addReview = asyncHandler(async (req, res, next) => {
  const { rating, review } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Make sure user is the customer
  if (order.customer.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to review this order', 401));
  }

  // Check if order is completed
  if (order.status !== 'completed') {
    return next(new ErrorResponse('Order must be completed to add review', 400));
  }

  order.rating = rating;
  order.review = review;
  await order.save();

  // Update shop rating
  const shop = await Shop.findById(order.shop);
  if (shop) {
    const shopOrders = await Order.find({ 
      shop: order.shop, 
      rating: { $exists: true, $ne: null } 
    });
    
    const totalRating = shopOrders.reduce((sum, ord) => sum + ord.rating, 0);
    shop.rating = totalRating / shopOrders.length;
    shop.reviewCount = shopOrders.length;
    await shop.save();
  }

  successResponse(res, { order }, 'Review added successfully');
});

// @desc    Get shop orders
// @route   GET /api/orders/shop/:shopId
// @access  Private
const getShopOrders = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findById(req.params.shopId);

  if (!shop) {
    return next(new ErrorResponse('Shop not found', 404));
  }

  // Make sure user is shop owner or admin
  if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access these orders', 401));
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const total = await Order.countDocuments({ shop: req.params.shopId });
  const orders = await Order.find({ shop: req.params.shopId })
    .populate('customer', 'name email phone')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  paginatedResponse(res, orders, page, limit, total, 'Shop orders retrieved successfully');
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Make sure user is shop owner or admin
  const shop = await Shop.findById(order.shop);
  if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this order', 401));
  }

  order.status = status;
  
  // Set completion date if status is completed
  if (status === 'completed') {
    order.actualCompletion = new Date();
  }

  await order.save();

  // Send SMS notification
  const customer = await User.findById(order.customer);
  if (customer) {
    await SMSService.sendOrderStatusUpdate(customer.phone, order.orderNumber, status);
  }

  successResponse(res, { order }, 'Order status updated successfully');
});

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment-status
// @access  Private
const updatePaymentStatus = asyncHandler(async (req, res, next) => {
  const { paymentStatus } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Make sure user is shop owner or admin
  const shop = await Shop.findById(order.shop);
  if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update payment status', 401));
  }

  order.paymentStatus = paymentStatus;
  await order.save();

  successResponse(res, { order }, 'Payment status updated successfully');
});

// @desc    Upload order images
// @route   POST /api/orders/:id/images
// @access  Private
const uploadOrderImages = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Make sure user is shop owner or admin
  const shop = await Shop.findById(order.shop);
  if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to upload images', 401));
  }

  if (!req.files || req.files.length === 0) {
    return next(new ErrorResponse('Please upload files', 400));
  }

  const newImages = req.files.map(file => ({
    type: file.path,
    description: file.originalname
  }));

  order.images = [...order.images, ...newImages];
  await order.save();

  successResponse(res, { images: order.images }, 'Images uploaded successfully');
});

// @desc    Update measurements
// @route   PUT /api/orders/:id/measurements
// @access  Private
const updateMeasurements = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Make sure user is shop owner or admin
  const shop = await Shop.findById(order.shop);
  if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update measurements', 401));
  }

  // Update measurements for each item
  req.body.items.forEach((itemUpdate, index) => {
    if (order.items[index]) {
      order.items[index].measurements = itemUpdate.measurements;
    }
  });

  await order.save();

  successResponse(res, { order }, 'Measurements updated successfully');
});

// @desc    Update estimated completion
// @route   PUT /api/orders/:id/estimated-completion
// @access  Private
const updateEstimatedCompletion = asyncHandler(async (req, res, next) => {
  const { estimatedCompletion } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Make sure user is shop owner or admin
  const shop = await Shop.findById(order.shop);
  if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update completion date', 401));
  }

  order.estimatedCompletion = estimatedCompletion;
  await order.save();

  successResponse(res, { order }, 'Estimated completion updated successfully');
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find()
    .populate('customer', 'name email phone')
    .populate('shop', 'name phone email')
    .sort({ createdAt: -1 });

  successResponse(res, { orders }, 'All orders retrieved successfully');
});

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res, next) => {
  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({ status: 'pending' });
  const completedOrders = await Order.countDocuments({ status: 'completed' });
  const totalRevenue = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  const stats = {
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
  };

  successResponse(res, { stats }, 'Order statistics retrieved successfully');
});

// @desc    Admin update order
// @route   PUT /api/orders/:id/admin-update
// @access  Private/Admin
const adminUpdateOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('customer', 'name email phone')
   .populate('shop', 'name phone email');

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  successResponse(res, { order }, 'Order updated successfully');
});

module.exports = {
  getMyOrders,
  createOrder,
  getOrder,
  cancelOrder,
  addReview,
  getShopOrders,
  updateOrderStatus,
  updatePaymentStatus,
  uploadOrderImages,
  updateMeasurements,
  updateEstimatedCompletion,
  getAllOrders,
  getOrderStats,
  adminUpdateOrder
}; 