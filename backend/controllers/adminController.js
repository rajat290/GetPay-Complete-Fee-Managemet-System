const Student = require("../models/Student");
const Payment = require("../models/Payment");
const FeeAssignment = require("../models/FeeAssignment");
const PaymentEvent = require("../models/PaymentEvent");

const requireAdmin = (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403).json({ error: "Access denied" });
    return false;
  }
  return true;
};

// Get all students (admin only)
exports.getAllStudents = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const students = await Student.find({ institutionId: req.institutionId }).select("-password");
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Create a new student (admin only)
exports.createStudent = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { name, email, registrationNo, className } = req.body;

    if (!name || !email || !registrationNo || !className) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check for existing student by email or registrationNo
    const studentExists = await Student.findOne({
      institutionId: req.institutionId,
      $or: [{ email }, { registrationNo }]
    });
    if (studentExists) {
      return res.status(400).json({ error: "Student with this email or registration number already exists" });
    }

    // Create new student
    const student = new Student({
      institutionId: req.institutionId,
      name,
      email,
      registrationNo,
      className,
      password: registrationNo, // Default password
      role: "student"
    });

    await student.save();

    // Remove password from response
    const studentObj = student.toObject();
    delete studentObj.password;

    res.status(201).json(studentObj);
  } catch (err) {
    console.error("Error creating student:", err);
    // Handle duplicate key error (in case of race condition)
    if (err.code === 11000) {
      return res.status(400).json({ error: "Student with this email or registration number already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Get all payments for admin dashboard
exports.getAllPayments = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { className, status, search, startDate, endDate } = req.query;
    
    let query = { institutionId: req.institutionId };
    
    // Filter by class
    if (className) {
      const students = await Student.find({
        institutionId: req.institutionId,
        className
      }).select("_id");
      query.studentId = { $in: students.map((student) => student._id) };
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by date range
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Search functionality
    if (search) {
      const matchingStudents = await Student.find({
        institutionId: req.institutionId,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { registrationNo: { $regex: search, $options: 'i' } }
        ]
      }).select("_id");

      query.$or = [
        { razorpayPaymentId: { $regex: search, $options: 'i' } },
        { studentId: { $in: matchingStudents.map((student) => student._id) } }
      ];
    }
    
    const payments = await Payment.find(query)
      .populate({
        path: 'studentId',
        select: 'name registrationNo className'
      })
      .populate({
        path: 'assignmentId',
        populate: {
          path: 'feeId',
          select: 'title'
        }
      })
      .sort({ createdAt: -1 });
    
    // Format the response
    const formattedPayments = payments.map(payment => ({
      _id: payment._id,
      paymentId: `PMT${payment._id.toString().slice(-6).toUpperCase()}`,
      studentId: `STD${payment.studentId.registrationNo}`,
      student: payment.studentId.name,
      amount: payment.amount,
      type: payment.assignmentId?.feeId?.title || 'Unknown',
      date: payment.createdAt,
      status: payment.status,
      mode: payment.mode,
      razorpayTransactionId: payment.razorpayPaymentId || '-',
      referenceNo: payment.referenceNo || '-',
      className: payment.studentId.className
    }));
    
    res.json(formattedPayments);
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get payment statistics for admin dashboard
exports.getPaymentStats = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { className, startDate, endDate } = req.query;
    
    let matchQuery = { institutionId: req.institutionId };
    
    // Filter by class
    if (className) {
      matchQuery['studentId.className'] = className;
    }
    
    // Filter by date range
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Get current month stats
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
    
    // Current month completed payments
    const currentMonthCompleted = await Payment.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'studentId'
        }
      },
      {
        $unwind: '$studentId'
      },
      {
        $match: {
          ...matchQuery,
          status: 'completed',
          createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Last month completed payments
    const lastMonthCompleted = await Payment.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'studentId'
        }
      },
      {
        $unwind: '$studentId'
      },
      {
        $match: {
          ...matchQuery,
          status: 'completed',
          createdAt: { $gte: lastMonth, $lte: lastDayOfLastMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Pending payments
    const pendingPayments = await Payment.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'studentId'
        }
      },
      {
        $unwind: '$studentId'
      },
      {
        $match: {
          ...matchQuery,
          status: 'pending'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Failed payments
    const failedPayments = await Payment.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'studentId'
        }
      },
      {
        $unwind: '$studentId'
      },
      {
        $match: {
          ...matchQuery,
          status: 'failed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const currentMonthTotal = currentMonthCompleted[0]?.total || 0;
    const lastMonthTotal = lastMonthCompleted[0]?.total || 0;
    const percentageChange = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1) : 0;
    
    const stats = {
      totalReceived: {
        amount: currentMonthTotal,
        percentageChange: parseFloat(percentageChange),
        trend: percentageChange >= 0 ? 'up' : 'down'
      },
      pending: {
        amount: pendingPayments[0]?.total || 0,
        count: pendingPayments[0]?.count || 0
      },
      failed: {
        amount: failedPayments[0]?.total || 0,
        count: failedPayments[0]?.count || 0
      }
    };
    
    res.json(stats);
  } catch (err) {
    console.error("Error fetching payment stats:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all unique class names
exports.getClassNames = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const classNames = await Student.distinct('className', { institutionId: req.institutionId });
    res.json(classNames);
  } catch (err) {
    console.error("Error fetching class names:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get payment details by ID
exports.getPaymentDetails = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { paymentId } = req.params;
    
    const payment = await Payment.findOne({ _id: paymentId, institutionId: req.institutionId })
      .populate({
        path: 'studentId',
        select: 'name registrationNo className email'
      })
      .populate({
        path: 'assignmentId',
        populate: {
          path: 'feeId',
          select: 'title description'
        }
      });
    
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    
    const formattedPayment = {
      _id: payment._id,
      paymentId: `PMT${payment._id.toString().slice(-6).toUpperCase()}`,
      student: {
        name: payment.studentId.name,
        registrationNo: payment.studentId.registrationNo,
        className: payment.studentId.className,
        email: payment.studentId.email
      },
      fee: {
        title: payment.assignmentId?.feeId?.title || 'Unknown',
        description: payment.assignmentId?.feeId?.description || ''
      },
      amount: payment.amount,
      status: payment.status,
      mode: payment.mode,
      referenceNo: payment.referenceNo,
      notes: payment.notes,
      razorpayTransactionId: payment.razorpayPaymentId,
      razorpayOrderId: payment.razorpayOrderId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt
    };
    
    res.json(formattedPayment);
  } catch (err) {
    console.error("Error fetching payment details:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get recent payments for real-time updates
exports.getRecentPayments = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { limit = 10 } = req.query;
    
    const recentPayments = await Payment.find({ institutionId: req.institutionId })
      .populate({
        path: 'studentId',
        select: 'name registrationNo className'
      })
      .populate({
        path: 'assignmentId',
        populate: {
          path: 'feeId',
          select: 'title'
        }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    // Format the response
    const formattedPayments = recentPayments.map(payment => ({
      _id: payment._id,
      paymentId: `PMT${payment._id.toString().slice(-6).toUpperCase()}`,
      studentId: `STD${payment.studentId.registrationNo}`,
      student: payment.studentId.name,
      amount: payment.amount,
      type: payment.assignmentId?.feeId?.title || 'Unknown',
      date: payment.createdAt,
      status: payment.status,
      mode: payment.mode,
      razorpayTransactionId: payment.razorpayPaymentId || '-',
      referenceNo: payment.referenceNo || '-',
      className: payment.studentId.className,
      isNew: new Date(payment.createdAt) > new Date(Date.now() - 5 * 60 * 1000) // New if created in last 5 minutes
    }));
    
    res.json(formattedPayments);
  } catch (err) {
    console.error("Error fetching recent payments:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Record offline/manual payment for an assigned fee
exports.recordOfflinePayment = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { studentId, assignmentId, amount, mode, referenceNo, notes } = req.body;

    const [student, assignment] = await Promise.all([
      Student.findOne({ _id: studentId, institutionId: req.institutionId }),
      FeeAssignment.findOne({
        _id: assignmentId,
        institutionId: req.institutionId,
        studentId
      }).populate("feeId", "amount title")
    ]);

    if (!student || !assignment || !assignment.feeId) {
      return res.status(404).json({ error: "Student or fee assignment not found" });
    }

    if (assignment.status === "paid") {
      return res.status(409).json({ error: "Fee assignment is already paid" });
    }

    if (Number(amount) !== assignment.feeId.amount) {
      return res.status(400).json({ error: "Payment amount must match assigned fee amount" });
    }

    const existingCompleted = await Payment.findOne({
      institutionId: req.institutionId,
      assignmentId,
      status: "completed"
    });

    if (existingCompleted) {
      return res.status(409).json({ error: "Payment already recorded for this assignment" });
    }

    const payment = await Payment.create({
      institutionId: req.institutionId,
      studentId,
      assignmentId,
      amount: assignment.feeId.amount,
      currency: "INR",
      mode,
      status: "completed",
      gateway: "manual",
      gatewayStatus: "recorded",
      referenceNo,
      notes,
      collectedBy: req.user._id,
      verifiedAt: new Date()
    });

    await FeeAssignment.findOneAndUpdate(
      { _id: assignmentId, institutionId: req.institutionId, studentId },
      { status: "paid" }
    );

    await PaymentEvent.create({
      institutionId: req.institutionId,
      paymentId: payment._id,
      gateway: "manual",
      eventType: "manual.payment.recorded",
      payload: {
        referenceNo,
        notes,
        recordedBy: req.user._id
      },
      source: "admin_manual"
    });

    res.status(201).json({
      _id: payment._id,
      paymentId: `PMT${payment._id.toString().slice(-6).toUpperCase()}`,
      student: student.name,
      amount: payment.amount,
      mode: payment.mode,
      status: payment.status,
      referenceNo: payment.referenceNo,
      feeTitle: assignment.feeId.title,
      createdAt: payment.createdAt
    });
  } catch (err) {
    console.error("Error recording offline payment:", err);
    res.status(500).json({ error: "Server error" });
  }
};
