const createFeeSchema = {
  body: {
    title: { required: true },
    amount: { required: true, type: "number" },
    category: { required: true, enum: ["Tuition", "Hostel", "Transport", "Other"] },
    dueDate: { required: true }
  }
};

const assignFeeSchema = {
  body: {
    studentId: { required: true, type: "objectId" },
    feeId: { required: true, type: "objectId" },
    dueDate: { required: true }
  }
};

module.exports = { createFeeSchema, assignFeeSchema };
