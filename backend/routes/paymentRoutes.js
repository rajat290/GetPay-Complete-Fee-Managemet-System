const express = require('express');

const { createOrder, verifyPayment, getPaymentHistory } = require('../controllers/paymentController');
const { protect, requireStudent } = require('../middleware/authMiddleware');
const rateLimit = require('../middleware/rateLimitMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createOrderSchema, verifyPaymentSchema } = require('../validators/paymentValidators');

const router = express.Router();
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  keyPrefix: 'payment'
});

router.post('/create-order', paymentLimiter, protect, requireStudent, validateRequest(createOrderSchema), createOrder);
router.post('/verify', paymentLimiter, protect, requireStudent, validateRequest(verifyPaymentSchema), verifyPayment);
router.get('/history', protect, requireStudent, getPaymentHistory);

module.exports = router;
