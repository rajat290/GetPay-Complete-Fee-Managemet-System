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
const { protect, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, requireAdmin);

// GET /admin/students - Get all students (admin only)
router.get("/students", getAllStudents);

// POST /admin/students - Create a new student (admin only)
router.post("/students", createStudent);

// GET /admin/payments - Get all payments for admin dashboard
router.get("/payments", getAllPayments);

// GET /admin/payments/stats - Get payment statistics
router.get("/payments/stats", getPaymentStats);

// GET /admin/payments/recent - Get recent payments for real-time updates
router.get("/payments/recent", getRecentPayments);

// GET /admin/classes - Get all unique class names
router.get("/classes", getClassNames);

// GET /admin/payments/:paymentId - Get payment details
router.get("/payments/:paymentId", getPaymentDetails);

module.exports = router;
