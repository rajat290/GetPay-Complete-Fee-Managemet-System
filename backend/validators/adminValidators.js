const createStudentSchema = {
  body: {
    name: { required: true },
    email: { required: true, type: "email" },
    registrationNo: { required: true },
    className: { required: true }
  }
};

const paymentDetailsSchema = {
  params: {
    paymentId: { required: true, type: "objectId" }
  }
};

const recordOfflinePaymentSchema = {
  body: {
    studentId: { required: true, type: "objectId" },
    assignmentId: { required: true, type: "objectId" },
    amount: { required: true, type: "number" },
    mode: { required: true, enum: ["offline", "cash", "bank_transfer", "upi", "cheque"] }
  }
};

const studentLedgerSchema = {
  params: {
    studentId: { required: true, type: "objectId" }
  }
};

const inviteStudentSchema = {
  body: {
    name: { required: true },
    email: { required: true, type: "email" },
    registrationNo: { required: true },
    className: { required: true }
  }
};

const sendDuesRemindersSchema = {
  body: {
    channel: { enum: ["notification", "email", "both"] },
    status: { enum: ["pending", "overdue", "all"] },
    className: { maxLength: 80 },
    dueBeforeDays: { type: "number", min: 0, max: 365 },
    dryRun: { type: "boolean" }
  }
};

const updateInstitutionSettingsSchema = {
  body: {
    name: { minLength: 2, maxLength: 160 },
    type: { enum: ["school", "college", "coaching", "other"] },
    email: { type: "email" },
    phone: { maxLength: 30 },
    address: { maxLength: 500 },
    branding: { type: "object" },
    billingContact: { type: "object" }
  }
};

const reminderCampaignSchema = {
  body: {
    name: { required: true },
    channel: { enum: ["notification", "email", "both"] },
    status: { enum: ["pending", "overdue", "all"] },
    className: { maxLength: 80 },
    dueBeforeDays: { type: "number", min: 0, max: 365 }
  }
};

const reminderCampaignParamsSchema = {
  params: {
    campaignId: { required: true, type: "objectId" }
  },
  body: {
    channel: { enum: ["notification", "email", "both"] },
    status: { enum: ["pending", "overdue", "all"] },
    className: { maxLength: 80 },
    dueBeforeDays: { type: "number", min: 0, max: 365 },
    dryRun: { type: "boolean" }
  }
};

const roleSchema = {
  body: {
    name: { required: true, minLength: 2, maxLength: 80 },
    description: { maxLength: 300 },
    permissions: { type: "array" },
    isActive: { type: "boolean" }
  }
};

const roleParamsSchema = {
  params: {
    roleId: { required: true, type: "objectId" }
  }
};

const createStaffSchema = {
  body: {
    name: { required: true, minLength: 2, maxLength: 120 },
    email: { required: true, type: "email" },
    employeeCode: { required: true, minLength: 1, maxLength: 60 },
    roleIds: { type: "array" },
    password: { minLength: 8, maxLength: 128 }
  }
};

const staffParamsSchema = {
  params: {
    staffId: { required: true, type: "objectId" }
  }
};

module.exports = {
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
};
