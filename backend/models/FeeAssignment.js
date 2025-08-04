const mongoose = require('mongoose');

const feeAssignmentSchema = new mongoose.Schema({
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

module.exports = mongoose.model('FeeAssignment', feeAssignmentSchema);
// This schema defines the structure for the FeeAssignment model, which links students to fees with a due date and status.