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
    status: { enum: ["pending", "overdue", "all"] }
  }
};

const updateInstitutionSettingsSchema = {
  body: {
    type: { enum: ["school", "college", "coaching", "other"] },
    email: { type: "email" }
  }
};

const reminderCampaignSchema = {
  body: {
    name: { required: true },
    channel: { enum: ["notification", "email", "both"] },
    status: { enum: ["pending", "overdue", "all"] },
    dueBeforeDays: { type: "number" }
  }
};

const reminderCampaignParamsSchema = {
  params: {
    campaignId: { required: true, type: "objectId" }
  },
  body: {
    channel: { enum: ["notification", "email", "both"] },
    status: { enum: ["pending", "overdue", "all"] },
    dueBeforeDays: { type: "number" }
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
  reminderCampaignParamsSchema
};
