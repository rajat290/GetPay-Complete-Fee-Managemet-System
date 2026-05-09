const Institution = require("../models/Institution");

const MODULE_CATALOG = [
  {
    key: "student_management",
    name: "Student Management",
    description: "Students, classes, onboarding, and student ledgers"
  },
  {
    key: "fee_management",
    name: "Fee Management",
    description: "Fee templates, assignments, student payments, and receipts"
  },
  {
    key: "finance_operations",
    name: "Finance Operations",
    description: "Collections, dues, reconciliation, offline payments, and reminders"
  },
  {
    key: "analytics",
    name: "Analytics",
    description: "Dashboards, class reports, and institution-level metrics"
  },
  {
    key: "audit_trail",
    name: "Audit Trail",
    description: "Institution activity logs and compliance review"
  },
  {
    key: "settings",
    name: "Settings",
    description: "Institution profile, branding, billing contact, and subscription summary"
  }
];

const DEFAULT_MODULE_KEYS = MODULE_CATALOG.map((module) => module.key);
const VALID_MODULE_KEYS = new Set(DEFAULT_MODULE_KEYS);

const normalizeModules = (modules = DEFAULT_MODULE_KEYS) => {
  const values = Array.isArray(modules) ? modules : [];
  const normalized = values.filter((moduleKey) => VALID_MODULE_KEYS.has(moduleKey));
  return [...new Set(normalized)];
};

const getEnabledModules = (institution) => {
  if (!institution?.enabledModules || institution.enabledModules.length === 0) {
    return DEFAULT_MODULE_KEYS;
  }

  return normalizeModules(institution.enabledModules);
};

const institutionHasModule = (institution, moduleKey) => {
  if (!VALID_MODULE_KEYS.has(moduleKey)) return false;
  return getEnabledModules(institution).includes(moduleKey);
};

const loadInstitutionForModuleCheck = async (institutionId) => Institution.findById(institutionId).select("enabledModules isActive");

module.exports = {
  MODULE_CATALOG,
  DEFAULT_MODULE_KEYS,
  VALID_MODULE_KEYS,
  normalizeModules,
  getEnabledModules,
  institutionHasModule,
  loadInstitutionForModuleCheck
};
