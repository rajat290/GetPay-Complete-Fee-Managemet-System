const express = require('express');
const { getAnalytics, getFeeAnalytics, getPaymentAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Analytics routes
router.get('/', protect, getAnalytics);
router.get('/fees', protect, getFeeAnalytics);
router.get('/payments', protect, getPaymentAnalytics);

module.exports = router;
