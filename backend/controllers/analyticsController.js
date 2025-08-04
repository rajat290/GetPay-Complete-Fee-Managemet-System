const Payment = require("../models/Payment");
const FeeAssignment = require("../models/FeeAssignment");

exports.getAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const totalCollected = await Payment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const pendingFees = await FeeAssignment.countDocuments({ status: "pending" });

    const defaulters = await FeeAssignment.countDocuments({
      status: "pending",
      dueDate: { $lt: new Date() },
    });

    res.json({
      totalCollected: totalCollected[0]?.total || 0,
      pendingFees,
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
