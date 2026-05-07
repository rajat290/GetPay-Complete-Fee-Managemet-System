const mongoose = require("mongoose");

const academicSessionSchema = new mongoose.Schema({
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
  startsAt: {
    type: Date,
    required: true
  },
  endsAt: {
    type: Date,
    required: true
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

academicSessionSchema.index({ institutionId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("AcademicSession", academicSessionSchema);
