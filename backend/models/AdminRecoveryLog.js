const mongoose = require("mongoose");

const adminRecoveryLogSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
    index: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true,
  },
  action: {
    type: String,
    enum: ["force_password_change", "temporary_password_reset"],
    required: true,
  },
  reason: {
    type: String,
    trim: true,
    required: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  temporaryPasswordIssued: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("AdminRecoveryLog", adminRecoveryLogSchema);
