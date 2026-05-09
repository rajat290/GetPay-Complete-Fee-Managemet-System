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
const {
  getPermissionCatalog,
  listRoles,
  createRole,
  updateRole,
  listStaff,
  createStaff,
  updateStaff
} = require("../controllers/staffRbacController");
const { protect, requireAdminOrStaff } = require("../middleware/authMiddleware");
const { requireModule } = require("../middleware/moduleAccessMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");
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
  reminderCampaignParamsSchema,
  roleSchema,
  roleParamsSchema,
  createStaffSchema,
  staffParamsSchema
} = require("../validators/adminValidators");

const router = express.Router();

router.use(protect, requireAdminOrStaff);

// GET /admin/institution - Get institution profile and branding settings
router.get("/institution", getInstitutionSettings);

// PATCH /admin/institution - Update institution profile and branding settings
router.patch("/institution", requireModule("settings"), requirePermission("settings.manage"), validateRequest(updateInstitutionSettingsSchema), updateInstitutionSettings);

// GET /admin/permissions - List permission catalog for organization RBAC
router.get("/permissions", requireModule("settings"), requirePermission("staff.manage"), getPermissionCatalog);

// GET /admin/roles - List organization roles
router.get("/roles", requireModule("settings"), requirePermission("staff.manage"), listRoles);

// POST /admin/roles - Create organization role
router.post("/roles", requireModule("settings"), requirePermission("staff.manage"), validateRequest(roleSchema), createRole);

// PATCH /admin/roles/:roleId - Update organization role
router.patch("/roles/:roleId", requireModule("settings"), requirePermission("staff.manage"), validateRequest(roleParamsSchema), updateRole);

// GET /admin/staff - List staff users
router.get("/staff", requireModule("settings"), requirePermission("staff.manage"), listStaff);

// POST /admin/staff - Create staff user
router.post("/staff", requireModule("settings"), requirePermission("staff.manage"), validateRequest(createStaffSchema), createStaff);

// PATCH /admin/staff/:staffId - Update staff user
router.patch("/staff/:staffId", requireModule("settings"), requirePermission("staff.manage"), validateRequest(staffParamsSchema), updateStaff);

// GET /admin/students - Get all students (admin only)
router.get("/students", requireModule("student_management"), requirePermission("student.view"), getAllStudents);

// POST /admin/students - Create a new student (admin only)
router.post("/students", requireModule("student_management"), requirePermission("student.create"), validateRequest(createStudentSchema), createStudent);

// POST /admin/students/invite - Invite a student to activate their account
router.post("/students/invite", requireModule("student_management"), requirePermission("student.create"), validateRequest(inviteStudentSchema), inviteStudent);

// GET /admin/students/:studentId/ledger - Get student ledger
router.get("/students/:studentId/ledger", requireModule("fee_management"), requirePermission("fee.view"), validateRequest(studentLedgerSchema), getStudentLedger);

// GET /admin/payments - Get all payments for admin dashboard
router.get("/payments", requireModule("finance_operations"), requirePermission("fee.collect"), getAllPayments);

// GET /admin/payments/stats - Get payment statistics
router.get("/payments/stats", requireModule("finance_operations"), requirePermission("analytics.view"), getPaymentStats);

// GET /admin/payments/recent - Get recent payments for real-time updates
router.get("/payments/recent", requireModule("finance_operations"), requirePermission("fee.collect"), getRecentPayments);

// GET /admin/payments/reconciliation - Get accounting reconciliation report
router.get("/payments/reconciliation", requireModule("finance_operations"), requirePermission("report.export"), getPaymentReconciliation);

// POST /admin/payments/offline - Record manual/offline payment
router.post("/payments/offline", requireModule("finance_operations"), requirePermission("payment.record_offline"), validateRequest(recordOfflinePaymentSchema), recordOfflinePayment);

// GET /admin/classes - Get all unique class names
router.get("/classes", getClassNames);

// GET /admin/audit-logs - Get institution-scoped admin audit logs
router.get("/audit-logs", requireModule("audit_trail"), requirePermission("settings.manage"), getAuditLogs);

// POST /admin/dues/refresh-overdue - Mark overdue dues based on due date
router.post("/dues/refresh-overdue", requireModule("finance_operations"), requirePermission("fee.collect"), refreshOverdueDues);

// GET /admin/dues - Pending/overdue dues report
router.get("/dues", requireModule("finance_operations"), requirePermission("fee.view"), getDuesReport);

// POST /admin/dues/reminders - Preview/send due reminders
router.post("/dues/reminders", requireModule("finance_operations"), requirePermission("fee.collect"), validateRequest(sendDuesRemindersSchema), sendDuesReminders);

// GET /admin/reminder-campaigns - List reusable due reminder campaigns
router.get("/reminder-campaigns", requireModule("finance_operations"), requirePermission("fee.collect"), getReminderCampaigns);

// POST /admin/reminder-campaigns - Create reusable due reminder campaign
router.post("/reminder-campaigns", requireModule("finance_operations"), requirePermission("fee.collect"), validateRequest(reminderCampaignSchema), createReminderCampaign);

// PATCH /admin/reminder-campaigns/:campaignId - Update reusable due reminder campaign
router.patch("/reminder-campaigns/:campaignId", requireModule("finance_operations"), requirePermission("fee.collect"), validateRequest(reminderCampaignParamsSchema), updateReminderCampaign);

// POST /admin/reminder-campaigns/:campaignId/run - Preview/run reusable due reminder campaign
router.post("/reminder-campaigns/:campaignId/run", requireModule("finance_operations"), requirePermission("fee.collect"), validateRequest(reminderCampaignParamsSchema), runSavedReminderCampaign);

// GET /admin/payments/:paymentId - Get payment details
router.get("/payments/:paymentId", requireModule("finance_operations"), requirePermission("fee.collect"), validateRequest(paymentDetailsSchema), getPaymentDetails);

module.exports = router;
