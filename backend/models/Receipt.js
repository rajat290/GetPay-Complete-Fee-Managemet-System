const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  feeName: String,
  amount: Number,
  paymentDate: Date,
  pdfUrl: String,
});

module.exports = mongoose.model("Receipt", receiptSchema);
