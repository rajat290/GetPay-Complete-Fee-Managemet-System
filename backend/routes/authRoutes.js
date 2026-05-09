const express = require('express');
const { registerStudent, loginStudent, getProfile, requestPasswordReset, resetPassword, activateAccount, changePassword } = require('../controllers/authController');
const { protect} = require('../middleware/authMiddleware');
const rateLimit = require('../middleware/rateLimitMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { registerStudentSchema, loginSchema, requestPasswordResetSchema, resetPasswordSchema, activateAccountSchema, changePasswordSchema } = require('../validators/authValidators');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyPrefix: 'auth'
});

router.post('/register', authLimiter, validateRequest(registerStudentSchema), registerStudent);
router.post('/login', authLimiter, validateRequest(loginSchema), loginStudent);
router.post('/forgot-password', authLimiter, validateRequest(requestPasswordResetSchema), requestPasswordReset);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), resetPassword);
router.post('/activate-account', authLimiter, validateRequest(activateAccountSchema), activateAccount);
router.post('/change-password', protect, validateRequest(changePasswordSchema), changePassword);
router.get('/profile', protect, getProfile);
module.exports = router;
// This code sets up the authentication routes for student registration, login, and profile retrieval. It uses Express Router to define the routes and their corresponding controller functions.
// The `protect` middleware is applied to the profile route to ensure that only authenticated users can access it. The `registerStudent`, `loginStudent`, and `getProfile` functions are imported from the `authController` module, which contains the logic for handling these requests.
