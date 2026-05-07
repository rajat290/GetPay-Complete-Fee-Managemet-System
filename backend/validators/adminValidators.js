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

module.exports = { createStudentSchema, paymentDetailsSchema };
