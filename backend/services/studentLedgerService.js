const Student = require("../models/Student");
const FeeAssignment = require("../models/FeeAssignment");
const Payment = require("../models/Payment");

const buildStudentLedger = async ({ institutionId, studentId }) => {
  const student = await Student.findOne({
    _id: studentId,
    institutionId
  }).select("-password");

  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }

  const assignments = await FeeAssignment.find({
    institutionId,
    studentId
  })
    .populate("feeId", "title amount category dueDate")
    .sort({ dueDate: 1, createdAt: 1 });

  const payments = await Payment.find({
    institutionId,
    studentId
  }).sort({ createdAt: -1 });

  const paymentsByAssignment = payments.reduce((map, payment) => {
    const key = payment.assignmentId.toString();
    map[key] = map[key] || [];
    map[key].push(payment);
    return map;
  }, {});

  const summary = {
    assignedAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    assignmentCount: assignments.length,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0
  };

  const now = new Date();

  const rows = assignments.map((assignment) => {
    const assignmentPayments = paymentsByAssignment[assignment._id.toString()] || [];
    const completedPayments = assignmentPayments.filter((payment) => payment.status === "completed");
    const paidAmount = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const assignedAmount = assignment.feeId?.amount || 0;
    const balanceAmount = Math.max(assignedAmount - paidAmount, 0);
    const dueDate = assignment.dueDate || assignment.feeId?.dueDate;
    const isOverdue = balanceAmount > 0 && dueDate && new Date(dueDate) < now;
    const ledgerStatus = balanceAmount === 0 ? "paid" : isOverdue ? "overdue" : "pending";

    summary.assignedAmount += assignedAmount;
    summary.paidAmount += paidAmount;
    summary.pendingAmount += balanceAmount;

    if (ledgerStatus === "paid") {
      summary.paidCount += 1;
    } else if (ledgerStatus === "overdue") {
      summary.overdueCount += 1;
      summary.overdueAmount += balanceAmount;
    } else {
      summary.pendingCount += 1;
    }

    return {
      assignmentId: assignment._id,
      fee: assignment.feeId ? {
        _id: assignment.feeId._id,
        title: assignment.feeId.title,
        category: assignment.feeId.category,
        amount: assignedAmount
      } : null,
      dueDate,
      assignmentStatus: assignment.status,
      ledgerStatus,
      assignedAmount,
      paidAmount,
      balanceAmount,
      payments: assignmentPayments.map((payment) => ({
        _id: payment._id,
        paymentId: `PMT${payment._id.toString().slice(-6).toUpperCase()}`,
        amount: payment.amount,
        status: payment.status,
        mode: payment.mode,
        gateway: payment.gateway,
        referenceNo: payment.referenceNo || null,
        razorpayPaymentId: payment.razorpayPaymentId || null,
        createdAt: payment.createdAt,
        verifiedAt: payment.verifiedAt || null
      }))
    };
  });

  return {
    generatedAt: new Date(),
    student: {
      _id: student._id,
      name: student.name,
      email: student.email,
      registrationNo: student.registrationNo,
      className: student.className,
      status: student.status
    },
    summary,
    rows
  };
};

module.exports = {
  buildStudentLedger
};
