const Payment = require("../models/Payment");
const FeeAssignment = require("../models/FeeAssignment");
const Student = require("../models/Student");
const Fee = require("../models/Fee");

exports.getAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get total students count
    const totalStudents = await Student.countDocuments({ role: "student" });

    // Get total collected from completed payments
    const totalCollected = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Get pending fees amount
    const pendingFees = await Payment.aggregate([
      { $match: { status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Get defaulters count (pending payments)
    const defaulters = await Payment.countDocuments({ status: "pending" });

    res.json({
      totalStudents,
      totalCollected: totalCollected[0]?.total || 0,
      pendingFees: pendingFees[0]?.total || 0,
      defaulters,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFeeAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const feeStats = await FeeAssignment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    res.json(feeStats);
  } catch (error) {
    console.error("Error fetching fee analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPaymentAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const paymentStats = await Payment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    res.json(paymentStats);
  } catch (error) {
    console.error("Error fetching payment analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getClassAnalytics = async (req, res) => {
  try {
    const classes = await Student.distinct("className"); // sab classes ka naam

    const result = [];

    for (const className of classes) {
      const students = await Student.find({ className });
      const studentIds = students.map((s) => s._id);

      const totalCollected = await Fee.aggregate([
        { $match: { student: { $in: studentIds }, status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const pendingFees = await Fee.aggregate([
        { $match: { student: { $in: studentIds }, status: "pending" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const defaulters = await Fee.countDocuments({
        student: { $in: studentIds },
        status: "pending",
        dueDate: { $lt: new Date() },
      });

      result.push({
        className,
        totalCollected: totalCollected[0]?.total || 0,
        pendingFees: pendingFees[0]?.total || 0,
        defaulters,
      });
    }

    res.json(result);
  } catch (err) {
    console.error("Error in class analytics:", err);
    res.status(500).json({ error: "Server error" });
  }
};