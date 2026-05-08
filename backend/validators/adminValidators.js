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

const sendDuesRemindersSchema = {
  body: {
    channel: { enum: ["notification", "email", "both"] },
    status: { enum: ["pending", "overdue", "all"] }
  }
};

module.exports = { createStudentSchema, paymentDetailsSchema, recordOfflinePaymentSchema, studentLedgerSchema, sendDuesRemindersSchema };
