const Payment = require("../models/Payment");
const FeeAssignment = require("../models/FeeAssignment");
const Student = require("../models/Student");
const mongoose = require("mongoose");

/**
 * Aggregates collection data by period (Daily/Monthly)
 */
const getCollectionSummary = async ({ institutionId, startDate, endDate, groupBy = "day" }) => {
  const match = {
    institutionId: new mongoose.Types.ObjectId(institutionId),
    status: "completed",
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  };

  const groupFormat = groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";

  const summary = await Payment.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
        onlineAmount: { 
          $sum: { $cond: [{ $eq: ["$mode", "online"] }, "$amount", 0] } 
        },
        offlineAmount: { 
          $sum: { $cond: [{ $eq: ["$mode", "offline"] }, "$amount", 0] } 
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return summary;
};

/**
 * Aggregates collection data by Class
 */
const getClassWiseCollection = async ({ institutionId, startDate, endDate }) => {
  const match = {
    institutionId: new mongoose.Types.ObjectId(institutionId),
    status: "completed",
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  };

  const report = await Payment.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "students",
        localField: "studentId",
        foreignField: "_id",
        as: "student"
      }
    },
    { $unwind: "$student" },
    {
      $group: {
        _id: "$student.className",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  return report;
};

/**
 * Gets a list of defaulters (students with pending/overdue assignments)
 */
const getDefaultersReport = async ({ institutionId, className }) => {
  const query = {
    institutionId,
    status: { $in: ["pending", "overdue"] }
  };

  const assignments = await FeeAssignment.find(query)
    .populate("studentId", "name registrationNo className email rollNo")
    .populate("feeId", "title category")
    .lean();

  // Filter by className if provided
  let filtered = assignments;
  if (className && className !== "all") {
    filtered = assignments.filter(a => a.studentId?.className === className);
  }

  // Format report
  return filtered.map(a => ({
    studentName: a.studentId?.name || "Unknown",
    registrationNo: a.studentId?.registrationNo || "N/A",
    className: a.studentId?.className || "N/A",
    feeTitle: a.feeTitle || a.feeId?.title || "Fee",
    amountDue: a.amount || a.feeId?.amount || 0,
    dueDate: a.dueDate,
    status: a.status,
    daysOverdue: a.status === "overdue" ? 
      Math.floor((new Date() - new Date(a.dueDate)) / (1000 * 60 * 60 * 24)) : 0
  }));
};

/**
 * Payment Mode Distribution
 */
const getPaymentModeAnalysis = async ({ institutionId, startDate, endDate }) => {
  const match = {
    institutionId: new mongoose.Types.ObjectId(institutionId),
    status: "completed",
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  };

  return await Payment.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$mode",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = {
  getCollectionSummary,
  getClassWiseCollection,
  getDefaultersReport,
  getPaymentModeAnalysis
};
