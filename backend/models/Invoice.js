const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
    index: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  amountInr: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ["draft", "issued", "paid", "past_due", "void"],
    default: "issued",
    index: true
  },
  billingPeriodStart: {
    type: Date,
    required: true
  },
  billingPeriodEnd: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  paidAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    default: ""
  }
}, { timestamps: true });

invoiceSchema.index({ institutionId: 1, status: 1 });

module.exports = mongoose.model("Invoice", invoiceSchema);
