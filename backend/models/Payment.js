const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: true,
        index: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FeeAssignment',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    mode: {
        type: String,
        enum: ['online', 'offline', 'cash', 'bank_transfer', 'upi', 'cheque'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    gateway: {
        type: String,
        enum: ['razorpay', 'manual'],
        default: 'razorpay'
    },
    gatewayStatus: { type: String },
    failureReason: { type: String },
    referenceNo: {
        type: String,
        trim: true
    },
    collectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    notes: {
        type: String,
        trim: true
    },
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
    razorpaySignature: { type: String },
    verifiedAt: { type: Date },
}, { timestamps: true });

paymentSchema.index({ institutionId: 1, assignmentId: 1, status: 1 });
paymentSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Payment', paymentSchema);
