const mongoose = require("mongoose");

const classGroupSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
    index: true
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    index: true
  },
  academicSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicSession",
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  section: {
    type: String,
    trim: true
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

classGroupSchema.index({ institutionId: 1, academicSessionId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model("ClassGroup", classGroupSchema);
