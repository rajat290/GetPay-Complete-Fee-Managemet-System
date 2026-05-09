const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
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
  description: {
    type: String,
    trim: true,
    default: ""
  },
  permissions: [{
    type: String,
    trim: true
  }],
  isSystem: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

roleSchema.index({ institutionId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Role", roleSchema);
