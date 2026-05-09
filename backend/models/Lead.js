const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  source: {
    type: String,
    enum: ["trial_signup", "request_demo", "contact", "support"],
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["new", "contacted", "demo_scheduled", "trial_active", "converted", "lost"],
    default: "new",
    index: true,
  },
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
  },
  institutionName: {
    type: String,
    trim: true,
    required: true,
  },
  institutionType: {
    type: String,
    enum: ["school", "college", "coaching", "other"],
    default: "school",
  },
  contactName: {
    type: String,
    trim: true,
    required: true,
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
    index: true,
  },
  contactPhone: {
    type: String,
    trim: true,
  },
  planInterest: {
    type: String,
    enum: ["starter", "growth", "enterprise", "not_sure"],
    default: "not_sure",
  },
  subject: {
    type: String,
    trim: true,
  },
  message: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  followUpOwner: {
    type: String,
    trim: true,
  },
  nextFollowUpAt: {
    type: Date,
  },
  convertedAt: {
    type: Date,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

module.exports = mongoose.model("Lead", leadSchema);
