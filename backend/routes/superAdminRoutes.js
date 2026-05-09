const express = require("express");
const {
  getPlatformOverview,
  listInstitutions,
  getInstitution,
  getModuleCatalog,
  createInstitution,
  updateInstitution,
  updateInstitutionSubscription,
  updateInstitutionModules
} = require("../controllers/superAdminController");
const { protect, requireSuperAdmin } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createInstitutionSchema,
  institutionParamsSchema,
  updateInstitutionSubscriptionSchema,
  updateInstitutionModulesSchema
} = require("../validators/superAdminValidators");

const router = express.Router();

router.use(protect, requireSuperAdmin);

router.get("/overview", getPlatformOverview);
router.get("/modules", getModuleCatalog);
router.get("/institutions", listInstitutions);
router.post("/institutions", validateRequest(createInstitutionSchema), createInstitution);
router.get("/institutions/:institutionId", validateRequest(institutionParamsSchema), getInstitution);
router.patch("/institutions/:institutionId", validateRequest(institutionParamsSchema), updateInstitution);
router.patch(
  "/institutions/:institutionId/subscription",
  validateRequest(updateInstitutionSubscriptionSchema),
  updateInstitutionSubscription
);
router.patch(
  "/institutions/:institutionId/modules",
  validateRequest(updateInstitutionModulesSchema),
  updateInstitutionModules
);

module.exports = router;
