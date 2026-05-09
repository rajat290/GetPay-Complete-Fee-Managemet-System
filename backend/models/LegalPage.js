const mongoose = require("mongoose");

const legalPageSchema = new mongoose.Schema({
  slug: {
    type: String,
    enum: ["terms", "privacy", "refund-policy", "support"],
    unique: true,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "published",
  },
  lastReviewedAt: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model("LegalPage", legalPageSchema);
