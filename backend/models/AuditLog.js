const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
    index: true
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true
  },
  actorRole: {
    type: String,
    enum: ["admin", "student"],
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  entityType: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  summary: {
    type: String,
    required: true,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, { timestamps: true });

auditLogSchema.index({ institutionId: 1, createdAt: -1 });
auditLogSchema.index({ institutionId: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ institutionId: 1, entityType: 1, entityId: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
