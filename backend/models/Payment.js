const mongoose = require('mongoose');

const paymenrtSchema = new mongoose.Schema({
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
    mode: {
        type: String,
        enum: ['online', 'offline'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
    razorpaySignature: { type: String },
}, { timestamps: true });



module.exports = mongoose.model('Payment', paymenrtSchema);
// This schema defines the structure for the Payment model, which includes fields for student ID, assignment ID, amount, mode of payment, status, and Razorpay transaction details. It establishes relationships with the Student and FeeAssignment models through ObjectId references. The timestamps option automatically adds createdAt and updatedAt fields to the schema.  
// The status field can be 'pending', 'completed', or 'failed', indicating the payment status. Razorpay fields are included for integration with the Razorpay payment gateway.