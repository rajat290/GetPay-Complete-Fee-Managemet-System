const FeeAssignment = require("../models/FeeAssignment");
const Student = require("../models/Student");
const Payment = require("../models/Payment");

const endOfDay = (value) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const refreshOverdueAssignments = async ({ institutionId, asOfDate = new Date() }) => {
  const result = await FeeAssignment.updateMany(
    {
      institutionId,
      status: "pending",
      dueDate: { $lt: asOfDate }
    },
    { status: "overdue" }
  );

  return {
    matchedCount: result.matchedCount || 0,
    modifiedCount: result.modifiedCount || 0
  };
};

const buildDuesReport = async ({ institutionId, filters = {} }) => {
  const assignmentQuery = {
    institutionId,
    status: { $in: ["pending", "overdue"] }
  };

  if (filters.status && filters.status !== "all") {
    assignmentQuery.status = filters.status;
  }

  if (filters.dueBefore) {
    assignmentQuery.dueDate = {
      ...(assignmentQuery.dueDate || {}),
      $lte: endOfDay(filters.dueBefore)
    };
  }

  if (filters.className) {
    const students = await Student.find({
      institutionId,
      className: filters.className,
      role: "student"
    }).select("_id");

    assignmentQuery.studentId = { $in: students.map((student) => student._id) };
  }

  const assignments = await FeeAssignment.find(assignmentQuery)
    .populate("studentId", "name email registrationNo className guardian")
    .populate("feeId", "title amount category dueDate")
    .sort({ dueDate: 1, createdAt: 1 });

  const assignmentIds = assignments.map((assignment) => assignment._id);
  const completedPayments = await Payment.find({
    institutionId,
    assignmentId: { $in: assignmentIds },
    status: "completed"
  }).select("assignmentId amount");

  const paidByAssignment = completedPayments.reduce((map, payment) => {
    const key = payment.assignmentId.toString();
    map[key] = (map[key] || 0) + payment.amount;
    return map;
  }, {});

  const summary = {
    assignmentCount: 0,
    studentCount: 0,
    totalDueAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    pendingCount: 0,
    overdueCount: 0
  };

  const studentIds = new Set();

  const rows = assignments
    .map((assignment) => {
      const assignedAmount = assignment.feeId?.amount || 0;
      const paidAmount = paidByAssignment[assignment._id.toString()] || 0;
      const dueAmount = Math.max(assignedAmount - paidAmount, 0);

      if (dueAmount <= 0) return null;

      studentIds.add(assignment.studentId?._id?.toString());
      summary.assignmentCount += 1;
      summary.totalDueAmount += dueAmount;

      if (assignment.status === "overdue") {
        summary.overdueAmount += dueAmount;
        summary.overdueCount += 1;
      } else {
        summary.pendingAmount += dueAmount;
        summary.pendingCount += 1;
      }

      return {
        assignmentId: assignment._id,
        student: assignment.studentId ? {
          _id: assignment.studentId._id,
          name: assignment.studentId.name,
          email: assignment.studentId.email,
          registrationNo: assignment.studentId.registrationNo,
          className: assignment.studentId.className,
          guardian: assignment.studentId.guardian
        } : null,
        fee: assignment.feeId ? {
          _id: assignment.feeId._id,
          title: assignment.feeId.title,
          category: assignment.feeId.category,
          amount: assignedAmount
        } : null,
        assignedAmount,
        paidAmount,
        dueAmount,
        dueDate: assignment.dueDate,
        status: assignment.status
      };
    })
    .filter(Boolean);

  summary.studentCount = studentIds.size;

  return {
    generatedAt: new Date(),
    filters,
    summary,
    rows
  };
};

module.exports = {
  refreshOverdueAssignments,
  buildDuesReport
};
