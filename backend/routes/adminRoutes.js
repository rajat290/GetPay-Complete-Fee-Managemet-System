const express = require("express");
const { 
  getAllStudents, 
  createStudent, 
  getAllPayments, 
  getPaymentStats, 
  getClassNames, 
  getPaymentDetails,
  getRecentPayments,
  recordOfflinePayment,
  getPaymentReconciliation,
  getStudentLedger,
  refreshOverdueDues,
  getDuesReport,
  getAuditLogs,
  sendDuesReminders
} = require("../controllers/adminController");
const { protect, requireAdmin } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { createStudentSchema, paymentDetailsSchema, recordOfflinePaymentSchema, studentLedgerSchema, sendDuesRemindersSchema } = require("../validators/adminValidators");

const router = express.Router();

router.use(protect, requireAdmin);

// GET /admin/students - Get all students (admin only)
router.get("/students", getAllStudents);

// POST /admin/students - Create a new student (admin only)
router.post("/students", validateRequest(createStudentSchema), createStudent);

// GET /admin/students/:studentId/ledger - Get student ledger
router.get("/students/:studentId/ledger", validateRequest(studentLedgerSchema), getStudentLedger);

// GET /admin/payments - Get all payments for admin dashboard
router.get("/payments", getAllPayments);

// GET /admin/payments/stats - Get payment statistics
router.get("/payments/stats", getPaymentStats);

// GET /admin/payments/recent - Get recent payments for real-time updates
router.get("/payments/recent", getRecentPayments);

// GET /admin/payments/reconciliation - Get accounting reconciliation report
router.get("/payments/reconciliation", getPaymentReconciliation);

// POST /admin/payments/offline - Record manual/offline payment
router.post("/payments/offline", validateRequest(recordOfflinePaymentSchema), recordOfflinePayment);

// GET /admin/classes - Get all unique class names
router.get("/classes", getClassNames);

// GET /admin/audit-logs - Get institution-scoped admin audit logs
router.get("/audit-logs", getAuditLogs);

// POST /admin/dues/refresh-overdue - Mark overdue dues based on due date
router.post("/dues/refresh-overdue", refreshOverdueDues);

// GET /admin/dues - Pending/overdue dues report
router.get("/dues", getDuesReport);

// POST /admin/dues/reminders - Preview/send due reminders
router.post("/dues/reminders", validateRequest(sendDuesRemindersSchema), sendDuesReminders);

// GET /admin/payments/:paymentId - Get payment details
router.get("/payments/:paymentId", validateRequest(paymentDetailsSchema), getPaymentDetails);

module.exports = router;
