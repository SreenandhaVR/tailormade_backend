const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const { 
  successResponse, 
  createdResponse, 
  unauthorizedResponse, 
  notFoundResponse 
} = require('../utils/responseHelper');
const SMSService = require('../utils/smsService');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, deviceToken, deviceType } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !phone) {
    return next(new ErrorResponse('Please provide firstName, lastName, email, and phone', 400));
  }

  // Validate phone number
  if (phone.length !== 10) {
    return next(new ErrorResponse('Phone number must be exactly 10 digits', 400));
  }

  // Check if user already exists by email or phone
  const existingUserByEmail = await User.findOne({ email });
  if (existingUserByEmail) {
    return next(new ErrorResponse('User with this email already exists', 400));
  }

  const existingUserByPhone = await User.findOne({ phone });
  if (existingUserByPhone) {
    return next(new ErrorResponse('User with this phone number already exists', 400));
  }

  // Combine firstName and lastName
  const name = `${firstName} ${lastName}`;

  // Use provided password or generate a random password for phone-based registration
  const userPassword = password || crypto.randomBytes(32).toString('hex');

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password: userPassword,
    role: 'user',
    isVerified: true, // Auto-verify for registration flow
    deviceToken: deviceToken || null,
    deviceType: deviceType || 1
  });

  // Generate JWT token
  const token = user.getSignedJwtToken();

  // Return success response matching Android app expectations
  successResponse(res, {
    user: {
      id: user._id,
      name: user.name,
      firstName: firstName,
      lastName: lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified
    },
    token
  }, 'Registration successful');
});

// @desc    Login with phone number (OTP-based)
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { phone, deviceToken, deviceType } = req.body;

  // Validate phone number
  if (!phone || phone.length !== 10) {
    return next(new ErrorResponse('Please provide a valid 10-digit phone number', 400));
  }

  // Check for user by phone number
  let user = await User.findOne({ phone });
  
  if (!user) {
    // Create new user if doesn't exist (for phone-based login)
    user = await User.create({
      phone,
      name: `User_${phone}`, // Default name
      email: `${phone}@tailormade.com`, // Temporary email
      password: crypto.randomBytes(32).toString('hex'), // Random password
      role: 'user',
      isVerified: false
    });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  
  // Store OTP in user document (you might want to create a separate OTP model)
  user.verificationToken = otp;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  await user.save();

  // Send OTP via SMS
  const smsResult = await SMSService.sendVerificationCode(phone, otp);
  
  if (!smsResult.success) {
    console.warn('SMS not sent, but continuing with OTP:', otp);
  }

  // Return user data with OTP (in production, don't return OTP in response)
  successResponse(res, {
    data: {
      userId: user._id,
      phone: user.phone,
      otp: otp, // Remove this in production, only for development
      message: 'OTP sent successfully'
    }
  }, 'Login initiated successfully. Please enter the OTP.');
});

// @desc    Verify OTP and complete login
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res, next) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return next(new ErrorResponse('Phone number and OTP are required', 400));
  }

  // Find user by phone
  const user = await User.findOne({ phone });
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Check if OTP is valid and not expired
  if (user.verificationToken !== otp) {
    return next(new ErrorResponse('Invalid OTP', 400));
  }

  if (user.resetPasswordExpire < Date.now()) {
    return next(new ErrorResponse('OTP has expired', 400));
  }

  // Mark user as verified
  user.isVerified = true;
  user.verificationToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Generate JWT token
  const token = user.getSignedJwtToken();

  successResponse(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified
    },
    token
  }, 'OTP verified successfully. Login completed.');
});

// @desc    Traditional email/password login
// @route   POST /api/auth/login-email
// @access  Public
const loginWithEmail = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Generate token
  const token = user.getSignedJwtToken();

  successResponse(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified
    },
    token
  }, 'Login successful');
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  successResponse(res, { user }, 'User profile retrieved successfully');
});

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  const token = user.getSignedJwtToken();

  successResponse(res, { token }, 'Password updated successfully');
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save({ validateBeforeSave: false });

  // Send SMS
  await SMSService.sendPasswordReset(user.phone, resetToken);

  successResponse(res, {}, 'Password reset SMS sent');
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = user.getSignedJwtToken();

  successResponse(res, { token }, 'Password reset successful');
});

// @desc    Verify email
// @route   POST /api/auth/verify-email/:verificationToken
// @access  Public
const verifyEmail = asyncHandler(async (req, res, next) => {
  const { verificationToken } = req.params;

  const user = await User.findOne({ verificationToken });
  if (!user) {
    return next(new ErrorResponse('Invalid verification token', 400));
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  successResponse(res, {}, 'Email verified successfully');
});

// @desc    Resend verification
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (user.isVerified) {
    return next(new ErrorResponse('User is already verified', 400));
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = verificationToken;
  await user.save();

  // Send verification SMS
  await SMSService.sendVerificationCode(user.phone, verificationToken);

  successResponse(res, {}, 'Verification SMS sent');
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  successResponse(res, {}, 'Logged out successfully');
});

// @desc    Get all users (Admin)
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('-password');
  successResponse(res, { users }, 'Users retrieved successfully');
});

// @desc    Verify user (Admin)
// @route   PUT /api/auth/users/:id/verify
// @access  Private/Admin
const verifyUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isVerified: true, verificationToken: undefined },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  successResponse(res, { user }, 'User verified successfully');
});

// @desc    Resend OTP for phone verification
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = asyncHandler(async (req, res, next) => {
  const { phone } = req.body;

  if (!phone || phone.length !== 10) {
    return next(new ErrorResponse('Please provide a valid 10-digit phone number', 400));
  }

  // Find user by phone
  const user = await User.findOne({ phone });
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  
  // Store OTP in user document
  user.verificationToken = otp;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  await user.save();

  // Send OTP via SMS
  const smsResult = await SMSService.sendVerificationCode(phone, otp);
  
  if (!smsResult.success) {
    console.warn('SMS not sent, but continuing with OTP:', otp);
  }

  successResponse(res, {
    data: {
      phone: user.phone,
      otp: otp, // Remove this in production
      message: 'OTP resent successfully'
    }
  }, 'OTP resent successfully');
});

module.exports = {
  register,
  login,
  verifyOtp,
  loginWithEmail,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  logout,
  getUsers,
  verifyUser,
  resendOtp
}; 