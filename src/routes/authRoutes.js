const express = require('express');
const {
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
} = require('../controllers/authController');

const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const {
  loginValidation,
  otpVerificationValidation,
  emailLoginValidation,
  registerValidation,
  updatePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../utils/validationSchemas');

const router = express.Router();

// Public routes
router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.post('/verify-otp', otpVerificationValidation, validateRequest, verifyOtp);
router.post('/resend-otp', loginValidation, validateRequest, resendOtp);
router.post('/login-email', emailLoginValidation, validateRequest, loginWithEmail);
router.post('/forgot-password', forgotPasswordValidation, validateRequest, forgotPassword);
router.post('/reset-password/:resetToken', resetPasswordValidation, validateRequest, resetPassword);
router.post('/verify-email/:verificationToken', verifyEmail);
router.post('/resend-verification', forgotPasswordValidation, validateRequest, resendVerification);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePasswordValidation, validateRequest, updatePassword);
router.post('/logout', protect, logout);

// Admin routes
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id/verify', protect, authorize('admin'), verifyUser);

module.exports = router; 