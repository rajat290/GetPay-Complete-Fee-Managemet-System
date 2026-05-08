const mongoose = require("mongoose");

const reminderCampaignSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  channel: {
    type: String,
    enum: ["notification", "email", "both"],
    default: "notification"
  },
  filters: {
    className: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "overdue", "all"],
      default: "overdue"
    },
    dueBeforeDays: {
      type: Number,
      min: 0,
      max: 365,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastRunAt: {
    type: Date
  },
  runCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }
}, { timestamps: true });

reminderCampaignSchema.index({ institutionId: 1, name: 1 }, { unique: true });
reminderCampaignSchema.index({ institutionId: 1, isActive: 1, updatedAt: -1 });

module.exports = mongoose.model("ReminderCampaign", reminderCampaignSchema);
