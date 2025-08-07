const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['success', 'warning', 'error', 'info'],
    default: 'info'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedPayment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  relatedFee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeAssignment'
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
