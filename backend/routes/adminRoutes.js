const express = require("express");
const { 
  getAllStudents, 
  createStudent, 
  getAllPayments, 
  getPaymentStats, 
  getClassNames, 
  getPaymentDetails,
  getRecentPayments
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /admin/students - Get all students (admin only)
router.get("/students", protect, getAllStudents);

// POST /admin/students - Create a new student (admin only)
router.post("/students", protect, createStudent);

// GET /admin/payments - Get all payments for admin dashboard
router.get("/payments", protect, getAllPayments);

// GET /admin/payments/stats - Get payment statistics
router.get("/payments/stats", protect, getPaymentStats);

// GET /admin/classes - Get all unique class names
router.get("/classes", protect, getClassNames);

// GET /admin/payments/:paymentId - Get payment details
router.get("/payments/:paymentId", protect, getPaymentDetails);

// GET /admin/payments/recent - Get recent payments for real-time updates
router.get("/payments/recent", protect, getRecentPayments);

module.exports = router;
