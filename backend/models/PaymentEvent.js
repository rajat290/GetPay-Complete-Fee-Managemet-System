const mongoose = require("mongoose");

const paymentEventSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    index: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    index: true
  },
  gateway: {
    type: String,
    enum: ["razorpay"],
    default: "razorpay"
  },
  eventType: {
    type: String,
    required: true
  },
  gatewayEventId: {
    type: String,
    index: true
  },
  razorpayOrderId: {
    type: String,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    index: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed
  },
  source: {
    type: String,
    enum: ["checkout_verify", "webhook"],
    required: true
  },
  processedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

paymentEventSchema.index({ gatewayEventId: 1, source: 1 }, {
  unique: true,
  sparse: true
});

module.exports = mongoose.model("PaymentEvent", paymentEventSchema);
