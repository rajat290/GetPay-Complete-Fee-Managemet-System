const createInstitutionSchema = {
  body: {
    name: { required: true, minLength: 2, maxLength: 160 },
    code: { required: true, minLength: 2, maxLength: 40 },
    type: { enum: ["school", "college", "coaching", "other"] },
    email: { type: "email" },
    phone: { maxLength: 30 },
    plan: { enum: ["starter", "growth", "enterprise"] },
    subscriptionStatus: { enum: ["trialing", "active", "past_due", "paused", "cancelled"] },
    adminName: { required: true, minLength: 2, maxLength: 120 },
    adminEmail: { required: true, type: "email" },
    adminPassword: { required: true, minLength: 8, maxLength: 128 }
  }
};

const institutionParamsSchema = {
  params: {
    institutionId: { required: true, type: "objectId" }
  }
};

const updateInstitutionSchema = {
  params: {
    institutionId: { required: true, type: "objectId" }
  },
  body: {
    name: { minLength: 2, maxLength: 160 },
    type: { enum: ["school", "college", "coaching", "other"] },
    email: { type: "email" },
    phone: { maxLength: 30 },
    address: { maxLength: 500 },
    isActive: { type: "boolean" },
    billingContact: { type: "object" },
    branding: { type: "object" },
    plan: { enum: ["starter", "growth", "enterprise"] },
    subscriptionStatus: { enum: ["trialing", "active", "past_due", "paused", "cancelled"] }
  }
};

const updateInstitutionSubscriptionSchema = {
  params: {
    institutionId: { required: true, type: "objectId" }
  },
  body: {
    plan: { enum: ["starter", "growth", "enterprise"] },
    status: { enum: ["trialing", "active", "past_due", "paused", "cancelled"] },
    trialEndsAt: { type: "date" },
    currentPeriodEndsAt: { type: "date" },
    gracePeriodEndsAt: { type: "date" },
    limitOverrides: { type: "object" }
  }
};

const updateInstitutionModulesSchema = {
  params: {
    institutionId: { required: true, type: "objectId" }
  },
  body: {
    enabledModules: {
      required: true,
      arrayOfEnum: ["student_management", "fee_management", "finance_operations", "analytics", "audit_trail", "settings"]
    }
  }
};

const updateInstitutionRiskControlsSchema = {
  params: {
    institutionId: { required: true, type: "objectId" }
  },
  body: {
    freezeInstitution: { type: "boolean" },
    blockPayments: { type: "boolean" },
    disableLogins: { type: "boolean" },
    restrictExports: { type: "boolean" },
    reason: { required: true, minLength: 5, maxLength: 500 }
  }
};

const archiveInstitutionSchema = {
  params: {
    institutionId: { required: true, type: "objectId" }
  },
  body: {
    reason: { required: true, minLength: 5, maxLength: 500 }
  }
};

const extendTrialSchema = {
  params: {
    institutionId: { required: true, type: "objectId" }
  },
  body: {
    days: { required: true, type: "number", min: 1, max: 365 },
    reason: { maxLength: 500 }
  }
};

const convertTrialSchema = {
  params: {
    institutionId: { required: true, type: "objectId" }
  },
  body: {
    plan: { enum: ["starter", "growth", "enterprise"] },
    currentPeriodEndsAt: { type: "date" },
    reason: { maxLength: 500 }
  }
};

const updateLeadSchema = {
  params: {
    leadId: { required: true, type: "objectId" }
  },
  body: {
    status: { enum: ["new", "contacted", "demo_scheduled", "trial_active", "converted", "lost"] },
    followUpOwner: { maxLength: 120 },
    notes: { maxLength: 2000 },
    nextFollowUpAt: { type: "date" },
    planInterest: { enum: ["starter", "growth", "enterprise", "not_sure"] }
  }
};

const websiteContentSchema = {
  body: {
    announcement: { type: "object" },
    hero: { type: "object" },
    contact: { type: "object" },
    pricingPlans: { type: "array" },
    faqs: { type: "array" }
  }
};

const legalPageSchema = {
  params: {
    slug: { required: true, enum: ["terms", "privacy", "refund-policy", "support"] }
  },
  body: {
    title: { required: true, minLength: 2, maxLength: 160 },
    content: { required: true, minLength: 20, maxLength: 30000 },
    status: { enum: ["draft", "published"] },
    lastReviewedAt: { type: "date" }
  }
};

const announcementSchema = {
  body: {
    title: { required: true, minLength: 2, maxLength: 160 },
    message: { required: true, minLength: 5, maxLength: 4000 },
    audience: { enum: ["all", "institution"] },
    institutionId: { type: "objectId" },
    channel: { enum: ["in_app", "email", "notice"] },
    status: { enum: ["draft", "scheduled", "sent"] },
    scheduledAt: { type: "date" }
  }
};

const invoiceParamsSchema = {
  params: {
    institutionId: { required: true, type: "objectId" },
    invoiceId: { required: true, type: "objectId" }
  }
};

const createInvoiceSchema = {
  params: {
    institutionId: { required: true, type: "objectId" }
  },
  body: {
    amountInr: { required: true, type: "number", min: 1 },
    billingPeriodStart: { required: true, type: "date" },
    billingPeriodEnd: { required: true, type: "date" },
    dueDate: { required: true, type: "date" },
    notes: { maxLength: 1000 }
  }
};

const adminRecoveryParamsSchema = {
  params: {
    institutionId: { required: true, type: "objectId" },
    adminId: { required: true, type: "objectId" }
  }
};

const adminRecoverySchema = {
  params: adminRecoveryParamsSchema.params,
  body: {
    action: { enum: ["force_password_change", "temporary_password_reset"] },
    reason: { required: true, minLength: 5, maxLength: 500 },
    temporaryPassword: { minLength: 8, maxLength: 128 }
  }
};

const impersonationSchema = {
  params: adminRecoveryParamsSchema.params,
  body: {
    reason: { required: true, minLength: 10, maxLength: 500 }
  }
};

module.exports = {
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
  adminRecoveryParamsSchema,
  adminRecoverySchema,
  impersonationSchema
};
