const mongoose = require('mongoose');

const feeAssignmentSchema = new mongoose.Schema({
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: true,
        index: true
    },
    academicSessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AcademicSession',
        index: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    feeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fee',
        required: true
    },
    feeTitle: {
        type: String,
        trim: true,
        default: 'Fee'
    },
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    installmentName: {
        type: String,
        default: 'Full Payment'
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending'
    }
}, { timestamps: true });

// Updated index to allow multiple installments for the same fee type
feeAssignmentSchema.index({ institutionId: 1, studentId: 1, feeId: 1, installmentName: 1 }, { unique: true });

module.exports = mongoose.model('FeeAssignment', feeAssignmentSchema);
