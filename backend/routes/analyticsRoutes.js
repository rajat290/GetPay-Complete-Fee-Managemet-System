const express = require("express");
const {
  getAnalytics,
  getFeeAnalytics,
  getPaymentAnalytics
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Total summary (collected, pending, defaulters)
router.get("/", protect, getAnalytics);

// Category-wise fee totals
router.get("/fees", protect, getFeeAnalytics);

// Monthly payments trend
router.get("/payments", protect, getPaymentAnalytics);

module.exports = router;
