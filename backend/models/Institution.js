const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["school", "college", "coaching", "other"],
    default: "school",
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  branding: {
    logoUrl: {
      type: String,
      trim: true,
    },
    primaryColor: {
      type: String,
      trim: true,
      default: "#2563eb",
    },
    receiptFooter: {
      type: String,
      trim: true,
    },
  },
  billingContact: {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  subscription: {
    plan: {
      type: String,
      enum: ["starter", "growth", "enterprise"],
      default: "starter",
    },
    status: {
      type: String,
      enum: ["trialing", "active", "past_due", "paused", "cancelled"],
      default: "trialing",
    },
    trialEndsAt: {
      type: Date,
    },
    currentPeriodEndsAt: {
      type: Date,
    },
    externalCustomerId: {
      type: String,
      trim: true,
    },
  },
  enabledModules: [{
    type: String,
    enum: [
      "student_management",
      "fee_management",
      "finance_operations",
      "analytics",
      "audit_trail",
      "settings"
    ],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Institution", institutionSchema);
