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
const { protect, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, requireAdmin);

// Total summary (collected, pending, defaulters)
router.get("/", getAnalytics);

// Comprehensive dashboard analytics
router.get("/dashboard", getDashboardAnalytics);

// Class-wise collection report
router.get("/class-report", getClassWiseReport);

// Monthly revenue trends
router.get("/monthly-trends", getMonthlyRevenueTrends);

// Payment status distribution
router.get("/status-distribution", getPaymentStatusDistribution);

// Class-wise fee collection
router.get("/class/:className", getClassAnalytics);

// Category-wise fee totals
router.get("/fees", getFeeAnalytics);

// Monthly payments trend
router.get("/payments", getPaymentAnalytics);

module.exports = router;
