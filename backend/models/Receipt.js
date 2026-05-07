const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
    index: true
  },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  feeName: String,
  amount: Number,
  paymentDate: Date,
  pdfUrl: String,
});

module.exports = mongoose.model("Receipt", receiptSchema);
