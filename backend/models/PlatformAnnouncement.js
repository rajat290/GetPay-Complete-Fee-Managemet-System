const mongoose = require("mongoose");

const platformAnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  audience: {
    type: String,
    enum: ["all", "institution"],
    default: "all",
  },
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
  },
  channel: {
    type: String,
    enum: ["in_app", "email", "notice"],
    default: "in_app",
  },
  status: {
    type: String,
    enum: ["draft", "scheduled", "sent"],
    default: "draft",
  },
  scheduledAt: {
    type: Date,
  },
  sentAt: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model("PlatformAnnouncement", platformAnnouncementSchema);
