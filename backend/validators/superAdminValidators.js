const createInstitutionSchema = {
  body: {
    name: { required: true },
    code: { required: true },
    type: { enum: ["school", "college", "coaching", "other"] },
    email: { type: "email" },
    plan: { enum: ["starter", "growth", "enterprise"] },
    subscriptionStatus: { enum: ["trialing", "active", "past_due", "paused", "cancelled"] },
    adminName: { required: true },
    adminEmail: { required: true, type: "email" },
    adminPassword: { required: true }
  }
};

const institutionParamsSchema = {
  params: {
    institutionId: { required: true, type: "objectId" }
  },
  body: {
    type: { enum: ["school", "college", "coaching", "other"] },
    email: { type: "email" }
  }
};

const updateInstitutionSubscriptionSchema = {
  params: {
    institutionId: { required: true, type: "objectId" }
  },
  body: {
    plan: { enum: ["starter", "growth", "enterprise"] },
    status: { enum: ["trialing", "active", "past_due", "paused", "cancelled"] }
  }
};

const updateInstitutionModulesSchema = {
  params: {
    institutionId: { required: true, type: "objectId" }
  }
};

const invoiceParamsSchema = {
  params: {
    institutionId: { required: true, type: "objectId" },
    invoiceId: { required: true, type: "objectId" }
  }
};

module.exports = {
  createInstitutionSchema,
  institutionParamsSchema,
  updateInstitutionSubscriptionSchema,
  updateInstitutionModulesSchema,
  invoiceParamsSchema
};
