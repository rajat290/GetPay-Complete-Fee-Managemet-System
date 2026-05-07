const Payment = require("../models/Payment");
const Student = require("../models/Student");

const parseDateRange = ({ startDate, endDate }) => {
  const createdAt = {};

  if (startDate) {
    createdAt.$gte = new Date(startDate);
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    createdAt.$lte = end;
  }

  return Object.keys(createdAt).length > 0 ? createdAt : null;
};

const buildPaymentQuery = async ({ institutionId, className, status, mode, startDate, endDate }) => {
  const query = { institutionId };

  if (status && status !== "all") {
    query.status = status;
  }

  if (mode && mode !== "all") {
    query.mode = mode;
  }

  const createdAt = parseDateRange({ startDate, endDate });
  if (createdAt) {
    query.createdAt = createdAt;
  }

  if (className) {
    const students = await Student.find({ institutionId, className }).select("_id");
    query.studentId = { $in: students.map((student) => student._id) };
  }

  return query;
};

const emptySummary = () => ({
  totalAmount: 0,
  count: 0,
  completedAmount: 0,
  completedCount: 0,
  pendingAmount: 0,
  pendingCount: 0,
  failedAmount: 0,
  failedCount: 0
});

const addToSummary = (summary, payment) => {
  summary.totalAmount += payment.amount;
  summary.count += 1;

  if (payment.status === "completed") {
    summary.completedAmount += payment.amount;
    summary.completedCount += 1;
  } else if (payment.status === "pending") {
    summary.pendingAmount += payment.amount;
    summary.pendingCount += 1;
  } else if (payment.status === "failed") {
    summary.failedAmount += payment.amount;
    summary.failedCount += 1;
  }
};

const buildPaymentReconciliationReport = async ({ institutionId, filters = {} }) => {
  const query = await buildPaymentQuery({ institutionId, ...filters });

  const payments = await Payment.find(query)
    .populate("studentId", "name registrationNo className")
    .populate({
      path: "assignmentId",
      populate: { path: "feeId", select: "title amount category" }
    })
    .sort({ createdAt: -1 });

  const summary = emptySummary();
  const byMode = {};
  const byGateway = {};
  const byStatus = {};

  const rows = payments.map((payment) => {
    addToSummary(summary, payment);

    const modeKey = payment.mode || "unknown";
    const gatewayKey = payment.gateway || "unknown";
    const statusKey = payment.status || "unknown";

    byMode[modeKey] = byMode[modeKey] || emptySummary();
    byGateway[gatewayKey] = byGateway[gatewayKey] || emptySummary();
    byStatus[statusKey] = byStatus[statusKey] || emptySummary();

    addToSummary(byMode[modeKey], payment);
    addToSummary(byGateway[gatewayKey], payment);
    addToSummary(byStatus[statusKey], payment);

    return {
      _id: payment._id,
      paymentId: `PMT${payment._id.toString().slice(-6).toUpperCase()}`,
      student: payment.studentId ? {
        _id: payment.studentId._id,
        name: payment.studentId.name,
        registrationNo: payment.studentId.registrationNo,
        className: payment.studentId.className
      } : null,
      fee: payment.assignmentId?.feeId ? {
        title: payment.assignmentId.feeId.title,
        category: payment.assignmentId.feeId.category,
        assignedAmount: payment.assignmentId.feeId.amount
      } : null,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      mode: payment.mode,
      gateway: payment.gateway,
      gatewayStatus: payment.gatewayStatus,
      razorpayOrderId: payment.razorpayOrderId || null,
      razorpayPaymentId: payment.razorpayPaymentId || null,
      referenceNo: payment.referenceNo || null,
      failureReason: payment.failureReason || null,
      collectedBy: payment.collectedBy || null,
      createdAt: payment.createdAt,
      verifiedAt: payment.verifiedAt || null
    };
  });

  return {
    filters,
    generatedAt: new Date(),
    summary,
    byMode,
    byGateway,
    byStatus,
    rows
  };
};

module.exports = {
  buildPaymentReconciliationReport
};
