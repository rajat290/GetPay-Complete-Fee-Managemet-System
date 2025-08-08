const express = require("express");
const {
  getAnalytics,
  getDashboardAnalytics,
  getClassWiseReport,
  getMonthlyRevenueTrends,
  getPaymentStatusDistribution,
  getClassAnalytics,
  getFeeAnalytics,
  getPaymentAnalytics
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Total summary (collected, pending, defaulters)
router.get("/", protect, getAnalytics);

// Comprehensive dashboard analytics
router.get("/dashboard", protect, getDashboardAnalytics);

// Class-wise collection report
router.get("/class-report", protect, getClassWiseReport);

// Monthly revenue trends
router.get("/monthly-trends", protect, getMonthlyRevenueTrends);

// Payment status distribution
router.get("/status-distribution", protect, getPaymentStatusDistribution);

// Class-wise fee collection
router.get("/class/:className", protect, getClassAnalytics);

// Category-wise fee totals
router.get("/fees", protect, getFeeAnalytics);

// Monthly payments trend
router.get("/payments", protect, getPaymentAnalytics);

module.exports = router;
