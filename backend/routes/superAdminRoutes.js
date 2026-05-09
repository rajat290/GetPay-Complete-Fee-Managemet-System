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
  startAdminImpersonation,
  listImpersonationLogs,
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
  updateInstitutionSchema,
  updateInstitutionSubscriptionSchema,
  updateInstitutionModulesSchema,
  updateInstitutionRiskControlsSchema,
  archiveInstitutionSchema,
  extendTrialSchema,
  convertTrialSchema,
  updateLeadSchema,
  websiteContentSchema,
  legalPageSchema,
  announcementSchema,
  invoiceParamsSchema,
  createInvoiceSchema,
  adminRecoverySchema,
  impersonationSchema
} = require("../validators/superAdminValidators");

const router = express.Router();

router.use(protect, requireSuperAdmin);

router.get("/overview", getPlatformOverview);
router.get("/modules", getModuleCatalog);
router.post("/billing/refresh", runBillingLifecycleRefresh);
router.get("/leads", listLeads);
router.patch("/leads/:leadId", validateRequest(updateLeadSchema), updateLead);
router.get("/website-content", getWebsiteContent);
router.patch("/website-content", validateRequest(websiteContentSchema), updateWebsiteContent);
router.get("/legal-pages", listLegalPages);
router.put("/legal-pages/:slug", validateRequest(legalPageSchema), upsertLegalPage);
router.get("/announcements", listAnnouncements);
router.post("/announcements", validateRequest(announcementSchema), createAnnouncement);
router.get("/institutions", listInstitutions);
router.post("/institutions", validateRequest(createInstitutionSchema), createInstitution);
router.get("/institutions/:institutionId", validateRequest(institutionParamsSchema), getInstitution);
router.patch("/institutions/:institutionId", validateRequest(updateInstitutionSchema), updateInstitution);
router.patch("/institutions/:institutionId/archive", validateRequest(archiveInstitutionSchema), archiveInstitution);
router.patch("/institutions/:institutionId/restore", validateRequest(institutionParamsSchema), restoreInstitution);
router.patch("/institutions/:institutionId/risk-controls", validateRequest(updateInstitutionRiskControlsSchema), updateInstitutionRiskControls);
router.get("/institutions/:institutionId/admins", validateRequest(institutionParamsSchema), listOrganizationAdmins);
router.get("/institutions/:institutionId/admin-recovery-logs", validateRequest(institutionParamsSchema), listAdminRecoveryLogs);
router.get("/institutions/:institutionId/impersonation-logs", validateRequest(institutionParamsSchema), listImpersonationLogs);
router.post(
  "/institutions/:institutionId/admins/:adminId/recovery",
  validateRequest(adminRecoverySchema),
  recoverOrganizationAdmin
);
router.post(
  "/institutions/:institutionId/admins/:adminId/impersonate",
  validateRequest(impersonationSchema),
  startAdminImpersonation
);
router.get("/institutions/:institutionId/invoices", validateRequest(institutionParamsSchema), listInstitutionInvoices);
router.post("/institutions/:institutionId/invoices", validateRequest(createInvoiceSchema), createInstitutionInvoice);
router.patch("/institutions/:institutionId/invoices/:invoiceId/paid", validateRequest(invoiceParamsSchema), markInstitutionInvoicePaid);
router.patch(
  "/institutions/:institutionId/subscription",
  validateRequest(updateInstitutionSubscriptionSchema),
  updateInstitutionSubscription
);
router.patch(
  "/institutions/:institutionId/trial/extend",
  validateRequest(extendTrialSchema),
  extendInstitutionTrial
);
router.patch(
  "/institutions/:institutionId/trial/convert",
  validateRequest(convertTrialSchema),
  convertInstitutionTrial
);
router.patch(
  "/institutions/:institutionId/modules",
  validateRequest(updateInstitutionModulesSchema),
  updateInstitutionModules
);

module.exports = router;
