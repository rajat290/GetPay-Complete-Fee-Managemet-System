const mongoose = require("mongoose");

const impersonationLogSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
    index: true,
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  tokenExpiresAt: {
    type: Date,
    required: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model("ImpersonationLog", impersonationLogSchema);
