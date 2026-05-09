const express = require("express");
const {
  getPlatformOverview,
  listInstitutions,
  getInstitution,
  getModuleCatalog,
  createInstitution,
  updateInstitution,
  archiveInstitution,
  restoreInstitution,
  updateInstitutionRiskControls,
  updateInstitutionSubscription,
  extendInstitutionTrial,
  convertInstitutionTrial,
  updateInstitutionModules,
  listInstitutionInvoices,
  createInstitutionInvoice,
  markInstitutionInvoicePaid,
  listOrganizationAdmins,
  recoverOrganizationAdmin,
  listAdminRecoveryLogs,
  runBillingLifecycleRefresh,
  listLeads,
  updateLead,
  getWebsiteContent,
  updateWebsiteContent,
  listLegalPages,
  upsertLegalPage,
  listAnnouncements,
  createAnnouncement
} = require("../controllers/superAdminController");
const { protect, requireSuperAdmin } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createInstitutionSchema,
  institutionParamsSchema,
  updateInstitutionSubscriptionSchema,
  updateInstitutionModulesSchema,
  invoiceParamsSchema,
  adminRecoveryParamsSchema
} = require("../validators/superAdminValidators");

const router = express.Router();

router.use(protect, requireSuperAdmin);

router.get("/overview", getPlatformOverview);
router.get("/modules", getModuleCatalog);
router.post("/billing/refresh", runBillingLifecycleRefresh);
router.get("/leads", listLeads);
router.patch("/leads/:leadId", updateLead);
router.get("/website-content", getWebsiteContent);
router.patch("/website-content", updateWebsiteContent);
router.get("/legal-pages", listLegalPages);
router.put("/legal-pages/:slug", upsertLegalPage);
router.get("/announcements", listAnnouncements);
router.post("/announcements", createAnnouncement);
router.get("/institutions", listInstitutions);
router.post("/institutions", validateRequest(createInstitutionSchema), createInstitution);
router.get("/institutions/:institutionId", validateRequest(institutionParamsSchema), getInstitution);
router.patch("/institutions/:institutionId", validateRequest(institutionParamsSchema), updateInstitution);
router.patch("/institutions/:institutionId/archive", validateRequest(institutionParamsSchema), archiveInstitution);
router.patch("/institutions/:institutionId/restore", validateRequest(institutionParamsSchema), restoreInstitution);
router.patch("/institutions/:institutionId/risk-controls", validateRequest(institutionParamsSchema), updateInstitutionRiskControls);
router.get("/institutions/:institutionId/admins", validateRequest(institutionParamsSchema), listOrganizationAdmins);
router.get("/institutions/:institutionId/admin-recovery-logs", validateRequest(institutionParamsSchema), listAdminRecoveryLogs);
router.post(
  "/institutions/:institutionId/admins/:adminId/recovery",
  validateRequest(adminRecoveryParamsSchema),
  recoverOrganizationAdmin
);
router.get("/institutions/:institutionId/invoices", validateRequest(institutionParamsSchema), listInstitutionInvoices);
router.post("/institutions/:institutionId/invoices", validateRequest(institutionParamsSchema), createInstitutionInvoice);
router.patch("/institutions/:institutionId/invoices/:invoiceId/paid", validateRequest(invoiceParamsSchema), markInstitutionInvoicePaid);
router.patch(
  "/institutions/:institutionId/subscription",
  validateRequest(updateInstitutionSubscriptionSchema),
  updateInstitutionSubscription
);
router.patch(
  "/institutions/:institutionId/trial/extend",
  validateRequest(institutionParamsSchema),
  extendInstitutionTrial
);
router.patch(
  "/institutions/:institutionId/trial/convert",
  validateRequest(institutionParamsSchema),
  convertInstitutionTrial
);
router.patch(
  "/institutions/:institutionId/modules",
  validateRequest(updateInstitutionModulesSchema),
  updateInstitutionModules
);

module.exports = router;
