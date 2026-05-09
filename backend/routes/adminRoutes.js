const express = require("express");
const { 
  getAllStudents, 
  createStudent, 
  inviteStudent,
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
  sendDuesReminders,
  getInstitutionSettings,
  updateInstitutionSettings,
  getReminderCampaigns,
  createReminderCampaign,
  updateReminderCampaign,
  runSavedReminderCampaign
} = require("../controllers/adminController");
const { protect, requireAdmin } = require("../middleware/authMiddleware");
const { requireModule } = require("../middleware/moduleAccessMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createStudentSchema,
  inviteStudentSchema,
  paymentDetailsSchema,
  recordOfflinePaymentSchema,
  studentLedgerSchema,
  sendDuesRemindersSchema,
  updateInstitutionSettingsSchema,
  reminderCampaignSchema,
  reminderCampaignParamsSchema
} = require("../validators/adminValidators");

const router = express.Router();

router.use(protect, requireAdmin);

// GET /admin/institution - Get institution profile and branding settings
router.get("/institution", getInstitutionSettings);

// PATCH /admin/institution - Update institution profile and branding settings
router.patch("/institution", requireModule("settings"), validateRequest(updateInstitutionSettingsSchema), updateInstitutionSettings);

// GET /admin/students - Get all students (admin only)
router.get("/students", requireModule("student_management"), getAllStudents);

// POST /admin/students - Create a new student (admin only)
router.post("/students", requireModule("student_management"), validateRequest(createStudentSchema), createStudent);

// POST /admin/students/invite - Invite a student to activate their account
router.post("/students/invite", requireModule("student_management"), validateRequest(inviteStudentSchema), inviteStudent);

// GET /admin/students/:studentId/ledger - Get student ledger
router.get("/students/:studentId/ledger", requireModule("fee_management"), validateRequest(studentLedgerSchema), getStudentLedger);

// GET /admin/payments - Get all payments for admin dashboard
router.get("/payments", requireModule("finance_operations"), getAllPayments);

// GET /admin/payments/stats - Get payment statistics
router.get("/payments/stats", requireModule("finance_operations"), getPaymentStats);

// GET /admin/payments/recent - Get recent payments for real-time updates
router.get("/payments/recent", requireModule("finance_operations"), getRecentPayments);

// GET /admin/payments/reconciliation - Get accounting reconciliation report
router.get("/payments/reconciliation", requireModule("finance_operations"), getPaymentReconciliation);

// POST /admin/payments/offline - Record manual/offline payment
router.post("/payments/offline", requireModule("finance_operations"), validateRequest(recordOfflinePaymentSchema), recordOfflinePayment);

// GET /admin/classes - Get all unique class names
router.get("/classes", getClassNames);

// GET /admin/audit-logs - Get institution-scoped admin audit logs
router.get("/audit-logs", requireModule("audit_trail"), getAuditLogs);

// POST /admin/dues/refresh-overdue - Mark overdue dues based on due date
router.post("/dues/refresh-overdue", requireModule("finance_operations"), refreshOverdueDues);

// GET /admin/dues - Pending/overdue dues report
router.get("/dues", requireModule("finance_operations"), getDuesReport);

// POST /admin/dues/reminders - Preview/send due reminders
router.post("/dues/reminders", requireModule("finance_operations"), validateRequest(sendDuesRemindersSchema), sendDuesReminders);

// GET /admin/reminder-campaigns - List reusable due reminder campaigns
router.get("/reminder-campaigns", requireModule("finance_operations"), getReminderCampaigns);

// POST /admin/reminder-campaigns - Create reusable due reminder campaign
router.post("/reminder-campaigns", requireModule("finance_operations"), validateRequest(reminderCampaignSchema), createReminderCampaign);

// PATCH /admin/reminder-campaigns/:campaignId - Update reusable due reminder campaign
router.patch("/reminder-campaigns/:campaignId", requireModule("finance_operations"), validateRequest(reminderCampaignParamsSchema), updateReminderCampaign);

// POST /admin/reminder-campaigns/:campaignId/run - Preview/run reusable due reminder campaign
router.post("/reminder-campaigns/:campaignId/run", requireModule("finance_operations"), validateRequest(reminderCampaignParamsSchema), runSavedReminderCampaign);

// GET /admin/payments/:paymentId - Get payment details
router.get("/payments/:paymentId", requireModule("finance_operations"), validateRequest(paymentDetailsSchema), getPaymentDetails);

module.exports = router;
