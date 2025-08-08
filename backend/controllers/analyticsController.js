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

// Get comprehensive analytics dashboard data
exports.getDashboardAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Total Revenue (all completed payments)
    const totalRevenue = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Pending Payments
    const pendingPayments = await Payment.aggregate([
      { $match: { status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);

    // Total Expected Revenue (all payments)
    const totalExpected = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Calculate Collection Rate
    const revenue = totalRevenue[0]?.total || 0;
    const expected = totalExpected[0]?.total || 0;
    const collectionRate = expected > 0 ? ((revenue / expected) * 100).toFixed(2) : 0;

    // Monthly Revenue Data (last 12 months)
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 }
    ]);

    // Format monthly data
    const formattedMonthlyData = monthlyRevenue.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      revenue: item.total,
      count: item.count
    })).reverse();

    // Class-wise collection data
    const classWiseData = await Payment.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: '$student.className',
          totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } },
          pendingAmount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
          failedAmount: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, '$amount', 0] } },
          totalPayments: { $sum: 1 },
          completedPayments: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      },
      {
        $project: {
          className: '$_id',
          totalRevenue: 1,
          pendingAmount: 1,
          failedAmount: 1,
          totalPayments: 1,
          completedPayments: 1,
          collectionRate: {
            $multiply: [
              { $divide: ['$completedPayments', '$totalPayments'] },
              100
            ]
          }
        }
      },
      { $sort: { className: 1 } }
    ]);

    res.json({
      totalRevenue: revenue,
      pendingPayments: pendingPayments[0]?.total || 0,
      pendingCount: pendingPayments[0]?.count || 0,
      collectionRate: parseFloat(collectionRate),
      monthlyRevenue: formattedMonthlyData,
      classWiseData
    });
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Generate class-wise collection report
exports.getClassWiseReport = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { startDate, endDate, className } = req.query;
    
    let matchQuery = {};
    
    // Filter by date range
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Filter by class
    if (className) {
      matchQuery['student.className'] = className;
    }

    const reportData = await Payment.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      { $match: matchQuery },
      {
        $group: {
          _id: {
            className: '$student.className',
            status: '$status'
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.className',
          statuses: {
            $push: {
              status: '$_id.status',
              amount: '$amount',
              count: '$count'
            }
          },
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: '$count' }
        }
      },
      {
        $project: {
          className: '$_id',
          statuses: 1,
          totalAmount: 1,
          totalCount: 1,
          completed: {
            $let: {
              vars: {
                completedStatus: {
                  $filter: {
                    input: '$statuses',
                    cond: { $eq: ['$$this.status', 'completed'] }
                  }
                }
              },
              in: { $arrayElemAt: ['$$completedStatus.amount', 0] }
            }
          },
          pending: {
            $let: {
              vars: {
                pendingStatus: {
                  $filter: {
                    input: '$statuses',
                    cond: { $eq: ['$$this.status', 'pending'] }
                  }
                }
              },
              in: { $arrayElemAt: ['$$pendingStatus.amount', 0] }
            }
          },
          failed: {
            $let: {
              vars: {
                failedStatus: {
                  $filter: {
                    input: '$statuses',
                    cond: { $eq: ['$$this.status', 'failed'] }
                  }
                }
              },
              in: { $arrayElemAt: ['$$failedStatus.amount', 0] }
            }
          }
        }
      },
      {
        $project: {
          className: 1,
          totalAmount: 1,
          totalCount: 1,
          completed: { $ifNull: ['$completed', 0] },
          pending: { $ifNull: ['$pending', 0] },
          failed: { $ifNull: ['$failed', 0] },
          collectionRate: {
            $multiply: [
              { $divide: ['$completed', '$totalAmount'] },
              100
            ]
          }
        }
      },
      { $sort: { className: 1 } }
    ]);

    res.json({
      reportData,
      generatedAt: new Date(),
      filters: { startDate, endDate, className }
    });
  } catch (error) {
    console.error("Error generating class-wise report:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get monthly revenue trends
exports.getMonthlyRevenueTrends = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { months = 12 } = req.query;

    const monthlyData = await Payment.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: parseInt(months) }
    ]);

    const formattedData = monthlyData.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      revenue: item.revenue,
      count: item.count
    })).reverse();

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching monthly revenue trends:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get payment status distribution
exports.getPaymentStatusDistribution = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const statusDistribution = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          amount: 1
        }
      }
    ]);

    res.json(statusDistribution);
  } catch (error) {
    console.error("Error fetching payment status distribution:", error);
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
    const classes = await Student.distinct("className");

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