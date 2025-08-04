const Fee = require("../models/Fee");
const FeeAssignment = require("../models/FeeAssignment");

// Admin: Create a new Fee
exports.createFee = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, amount, category, dueDate } = req.body;
    if (!title || !amount || !category || !dueDate) {
      return res.status(400).json({ message: "All fields required" });
    }

    const fee = await Fee.create({ title, amount, category, dueDate });
    res.status(201).json(fee);
  } catch (err) {
    console.error("Error creating fee:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Assign Fee to a Student
exports.assignFee = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { studentId, feeId, dueDate } = req.body;
    if (!studentId || !feeId || !dueDate) {
      return res.status(400).json({ message: "All fields required" });
    }

    const assignment = await FeeAssignment.create({ studentId, feeId, dueDate, status: "pending" });
    res.status(201).json(assignment);
  } catch (err) {
    console.error("Error assigning fee:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Student: Get My Fees
exports.getStudentFees = async (req, res) => {
  try {
    const assignments = await FeeAssignment.find({ studentId: req.user._id })
      .populate("feeId")
      .sort({ dueDate: 1 });

    res.json(assignments);
  } catch (err) {
    console.error("Error fetching student fees:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: View All Fees
exports.getAllFees = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const fees = await Fee.find();
    res.json(fees);
  } catch (err) {
    console.error("Error fetching fees:", err);
    res.status(500).json({ message: "Server error" });
  }
};
