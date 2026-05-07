const createOrderSchema = {
  body: {
    assignmentId: { required: true, type: "objectId" },
    amount: { type: "number" }
  }
};

const verifyPaymentSchema = {
  body: {
    razorpay_order_id: { required: true },
    razorpay_payment_id: { required: true },
    razorpay_signature: { required: true },
    assignmentId: { required: true, type: "objectId" }
  }
};

module.exports = { createOrderSchema, verifyPaymentSchema };
