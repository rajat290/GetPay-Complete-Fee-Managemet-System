const Student = require("../models/Student");
const Payment = require("../models/Payment");
const FeeAssignment = require("../models/FeeAssignment");
const PaymentEvent = require("../models/PaymentEvent");
const Institution = require("../models/Institution");
const ReminderCampaign = require("../models/ReminderCampaign");
const crypto = require("crypto");
const emailService = require("../utils/emailService");
const { buildPaymentReconciliationReport } = require("../services/paymentReportService");
const { buildStudentLedger } = require("../services/studentLedgerService");
const { refreshOverdueAssignments, buildDuesReport } = require("../services/duesReportService");
const { logAdminAction, listAuditLogs } = require("../services/auditLogService");
const { sendDueReminders, runReminderCampaign } = require("../services/feeReminderService");
const { getEnabledModules } = require("../services/moduleAccessService");
const { getUserPermissions } = require("../middleware/permissionMiddleware");
const {
  buildSubscriptionSummary,
  assertCanAddStudent,
  assertCanAddReminderCampaign
} = require("../services/subscriptionPlanService");

const INVITE_TOKEN_EXPIRES_MINUTES = 7 * 24 * 60;

const requireAdmin = (req, res) => {
  if (!["admin", "staff"].includes(req.user.role)) {
    res.status(403).json({ error: "Access denied" });
    return false;
  }
  return true;
};

const applyAllowedFields = (target, source, fields) => {
  fields.forEach((field) => {
    if (source[field] !== undefined) {
      target[field] = source[field];
    }
  });
};

// Get editable institution settings for the current admin tenant
exports.getInstitutionSettings = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const institution = await Institution.findById(req.institutionId);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const subscriptionSummary = await buildSubscriptionSummary(institution);
    const institutionObj = institution.toObject();
    institutionObj.subscriptionSummary = subscriptionSummary;
    institutionObj.enabledModules = getEnabledModules(institution);
    institutionObj.userPermissions = getUserPermissions(req.user);

    res.json(institutionObj);
  } catch (err) {
    console.error("Error fetching institution settings:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update editable institution profile, branding, and billing contact settings
exports.updateInstitutionSettings = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const institution = await Institution.findById(req.institutionId);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const updatedFields = [];

    ["name", "type", "email", "phone", "address"].forEach((field) => {
      if (req.body[field] !== undefined) {
        institution[field] = req.body[field];
        updatedFields.push(field);
      }
    });

    if (req.body.branding && typeof req.body.branding === "object") {
      institution.branding = institution.branding || {};
      applyAllowedFields(institution.branding, req.body.branding, ["logoUrl", "primaryColor", "receiptFooter"]);
      updatedFields.push("branding");
    }

    if (req.body.billingContact && typeof req.body.billingContact === "object") {
      institution.billingContact = institution.billingContact || {};
      applyAllowedFields(institution.billingContact, req.body.billingContact, ["name", "email", "phone"]);
      updatedFields.push("billingContact");
    }

    await institution.save();

    await logAdminAction({
      req,
      action: "institution.settings_updated",
      entityType: "Institution",
      entityId: institution._id,
      summary: `Updated institution settings for ${institution.name}`,
      metadata: {
        institutionId: institution._id,
        updatedFields: [...new Set(updatedFields)]
      }
    });

    const subscriptionSummary = await buildSubscriptionSummary(institution);
    const institutionObj = institution.toObject();
    institutionObj.subscriptionSummary = subscriptionSummary;
    institutionObj.enabledModules = getEnabledModules(institution);
    institutionObj.userPermissions = getUserPermissions(req.user);

    res.json(institutionObj);
  } catch (err) {
    console.error("Error updating institution settings:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all students with pagination and search (admin only)
exports.getAllStudents = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { page = 1, limit = 10, search = "", className } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = { institutionId: req.institutionId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { registrationNo: { $regex: search, $options: "i" } },
      ];
    }

    if (className && className !== "all") {
      query.className = className;
    }

    const [students, total] = await Promise.all([
      Student.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Student.countDocuments(query)
    ]);

    res.json({
      data: students,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
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

    const institution = await Institution.findById(req.institutionId);
    await assertCanAddStudent(institution);

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

    await logAdminAction({
      req,
      action: "student.created",
      entityType: "Student",
      entityId: student._id,
      summary: `Created student ${student.name} (${student.registrationNo})`,
      metadata: {
        studentId: student._id,
        email: student.email,
        registrationNo: student.registrationNo,
        className: student.className
      }
    });

    res.status(201).json(studentObj);
  } catch (err) {
    if (err.code === "PLAN_STUDENT_LIMIT_REACHED") {
      return res.status(err.statusCode).json({ error: err.message, details: err.details });
    }
    console.error("Error creating student:", err);
    // Handle duplicate key error (in case of race condition)
    if (err.code === 11000) {
      return res.status(400).json({ error: "Student with this email or registration number already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Get all payments for admin dashboard with pagination
exports.getAllPayments = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { page = 1, limit = 10, className, status, search, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = { institutionId: req.institutionId };
    
    // Filter by class
    if (className && className !== "all") {
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
        { referenceNo: { $regex: search, $options: 'i' } },
        { studentId: { $in: matchingStudents.map((student) => student._id) } }
      ];
    }
    
    const [payments, total] = await Promise.all([
      Payment.find(query)
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
        .skip(skip)
        .limit(parseInt(limit)),
      Payment.countDocuments(query)
    ]);
    
    // Format the response
    const formattedPayments = payments.map(payment => ({
      _id: payment._id,
      paymentId: `PMT${payment._id.toString().slice(-6).toUpperCase()}`,
      studentId: `STD${payment.studentId?.registrationNo || 'N/A'}`,
      student: payment.studentId?.name || 'Unknown',
      amount: payment.amount,
      type: payment.assignmentId?.feeId?.title || 'Unknown',
      date: payment.createdAt,
      status: payment.status,
      mode: payment.mode,
      razorpayTransactionId: payment.razorpayPaymentId || '-',
      referenceNo: payment.referenceNo || '-',
      className: payment.studentId?.className || 'N/A'
    }));
    
    res.json({
      data: formattedPayments,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
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

    await logAdminAction({
      req,
      action: "payment.offline_recorded",
      entityType: "Payment",
      entityId: payment._id,
      summary: `Recorded ${mode} payment for ${student.name}`,
      metadata: {
        paymentId: payment._id,
        studentId,
        assignmentId,
        amount: payment.amount,
        mode,
        referenceNo,
        feeTitle: assignment.feeId.title
      }
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

// Get payment reconciliation report for accounting review
exports.getPaymentReconciliation = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const report = await buildPaymentReconciliationReport({
      institutionId: req.institutionId,
      filters: {
        className: req.query.className,
        status: req.query.status,
        mode: req.query.mode,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      }
    });

    res.json(report);
  } catch (err) {
    console.error("Error fetching payment reconciliation:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get a student fee ledger for admin/accounting review
exports.getStudentLedger = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const ledger = await buildStudentLedger({
      institutionId: req.institutionId,
      studentId: req.params.studentId
    });

    res.json(ledger);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }

    console.error("Error fetching student ledger:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Refresh pending assignments that have crossed their due date
exports.refreshOverdueDues = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const result = await refreshOverdueAssignments({
      institutionId: req.institutionId,
      asOfDate: req.body.asOfDate ? new Date(req.body.asOfDate) : new Date()
    });

    await logAdminAction({
      req,
      action: "dues.overdue_refreshed",
      entityType: "FeeAssignment",
      summary: `Refreshed overdue dues and updated ${result.modifiedCount} assignments`,
      metadata: {
        asOfDate: req.body.asOfDate || null,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });

    res.json(result);
  } catch (err) {
    console.error("Error refreshing overdue dues:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Invite a student to activate their own account
exports.inviteStudent = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { name, email, registrationNo, className } = req.body;

    const studentExists = await Student.findOne({
      institutionId: req.institutionId,
      $or: [{ email: email.toLowerCase() }, { registrationNo }]
    });
    if (studentExists) {
      return res.status(400).json({ error: "Student with this email or registration number already exists" });
    }

    const institution = await Institution.findById(req.institutionId);
    await assertCanAddStudent(institution);

    const inviteToken = crypto.randomBytes(32).toString("hex");
    const student = await Student.create({
      institutionId: req.institutionId,
      name,
      email,
      registrationNo,
      className,
      password: crypto.randomBytes(24).toString("hex"),
      role: "student",
      status: "inactive",
      passwordResetToken: crypto.createHash("sha256").update(inviteToken).digest("hex"),
      passwordResetExpires: new Date(Date.now() + INVITE_TOKEN_EXPIRES_MINUTES * 60 * 1000)
    });

    const frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || "http://localhost:5173";
    const institutionCode = req.user.institutionId?.code;
    const inviteUrl = `${frontendUrl.replace(/\/$/, "")}/activate-account?token=${inviteToken}&institutionCode=${institutionCode || ""}`;

    const emailResult = await emailService.sendAccountInvite({
      user: student,
      inviteUrl,
      expiresInMinutes: INVITE_TOKEN_EXPIRES_MINUTES
    });

    await logAdminAction({
      req,
      action: "student.invited",
      entityType: "Student",
      entityId: student._id,
      summary: `Invited student ${student.name} (${student.registrationNo})`,
      metadata: {
        studentId: student._id,
        email: student.email,
        registrationNo: student.registrationNo,
        className: student.className
      }
    });

    const studentObj = student.toObject();
    delete studentObj.password;
    delete studentObj.passwordResetToken;
    delete studentObj.passwordResetExpires;

    const response = { student: studentObj, message: "Student invitation created" };
    if (emailResult?.skipped && process.env.NODE_ENV !== "production") {
      response.inviteToken = inviteToken;
      response.inviteUrl = inviteUrl;
    }

    res.status(201).json(response);
  } catch (err) {
    if (err.code === "PLAN_STUDENT_LIMIT_REACHED") {
      return res.status(err.statusCode).json({ error: err.message, details: err.details });
    }
    console.error("Error inviting student:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Student with this email or registration number already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Get institution audit logs for admin review
exports.getAuditLogs = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const logs = await listAuditLogs({
      institutionId: req.institutionId,
      filters: {
        action: req.query.action,
        entityType: req.query.entityType,
        actorId: req.query.actorId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        page: req.query.page,
        limit: req.query.limit
      }
    });

    res.json(logs);
  } catch (err) {
    console.error("Error fetching audit logs:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get pending and overdue dues report for admin/accounting review
exports.getDuesReport = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const report = await buildDuesReport({
      institutionId: req.institutionId,
      filters: {
        className: req.query.className,
        status: req.query.status,
        dueBefore: req.query.dueBefore
      }
    });

    res.json(report);
  } catch (err) {
    console.error("Error fetching dues report:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Send or preview reminders for pending/overdue dues
exports.sendDuesReminders = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const result = await sendDueReminders({
      institutionId: req.institutionId,
      filters: {
        className: req.body.className,
        status: req.body.status,
        dueBefore: req.body.dueBefore
      },
      channel: req.body.channel || "notification",
      dryRun: Boolean(req.body.dryRun)
    });

    await logAdminAction({
      req,
      action: req.body.dryRun ? "dues.reminders_previewed" : "dues.reminders_sent",
      entityType: "Notification",
      summary: `${req.body.dryRun ? "Previewed" : "Sent"} due reminders to ${result.summary.matchedCount} students`,
      metadata: {
        filters: result.filters,
        channel: result.channel,
        matchedCount: result.summary.matchedCount,
        notificationCount: result.summary.notificationCount,
        emailAttemptCount: result.summary.emailAttemptCount,
        dryRun: result.summary.dryRun
      }
    });

    res.status(req.body.dryRun ? 200 : 201).json(result);
  } catch (err) {
    console.error("Error sending dues reminders:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// List saved due reminder campaigns for an institution
exports.getReminderCampaigns = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const campaigns = await ReminderCampaign.find({ institutionId: req.institutionId })
      .sort({ updatedAt: -1 })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    res.json(campaigns);
  } catch (err) {
    console.error("Error fetching reminder campaigns:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Create a reusable due reminder campaign
exports.createReminderCampaign = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const institution = await Institution.findById(req.institutionId);
    await assertCanAddReminderCampaign(institution);

    const campaign = await ReminderCampaign.create({
      institutionId: req.institutionId,
      name: req.body.name,
      channel: req.body.channel || "notification",
      filters: {
        className: req.body.className || "",
        status: req.body.status || "overdue",
        dueBeforeDays: Number(req.body.dueBeforeDays || 0)
      },
      isActive: req.body.isActive !== false,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    await logAdminAction({
      req,
      action: "reminder_campaign.created",
      entityType: "ReminderCampaign",
      entityId: campaign._id,
      summary: `Created reminder campaign ${campaign.name}`,
      metadata: {
        campaignId: campaign._id,
        channel: campaign.channel,
        filters: campaign.filters
      }
    });

    res.status(201).json(campaign);
  } catch (err) {
    if (err.code === "PLAN_REMINDER_CAMPAIGN_LIMIT_REACHED") {
      return res.status(err.statusCode).json({ error: err.message, details: err.details });
    }
    console.error("Error creating reminder campaign:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Reminder campaign with this name already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Update a reusable due reminder campaign
exports.updateReminderCampaign = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const campaign = await ReminderCampaign.findOne({
      _id: req.params.campaignId,
      institutionId: req.institutionId
    });

    if (!campaign) {
      return res.status(404).json({ error: "Reminder campaign not found" });
    }

    ["name", "channel", "isActive"].forEach((field) => {
      if (req.body[field] !== undefined) {
        campaign[field] = req.body[field];
      }
    });

    ["className", "status", "dueBeforeDays"].forEach((field) => {
      if (req.body[field] !== undefined) {
        campaign.filters[field] = field === "dueBeforeDays" ? Number(req.body[field]) : req.body[field];
      }
    });

    campaign.updatedBy = req.user._id;
    await campaign.save();

    await logAdminAction({
      req,
      action: "reminder_campaign.updated",
      entityType: "ReminderCampaign",
      entityId: campaign._id,
      summary: `Updated reminder campaign ${campaign.name}`,
      metadata: {
        campaignId: campaign._id,
        channel: campaign.channel,
        filters: campaign.filters,
        isActive: campaign.isActive
      }
    });

    res.json(campaign);
  } catch (err) {
    console.error("Error updating reminder campaign:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Reminder campaign with this name already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Preview or run a saved reminder campaign
exports.runSavedReminderCampaign = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { campaign, result } = await runReminderCampaign({
      institutionId: req.institutionId,
      campaignId: req.params.campaignId,
      dryRun: Boolean(req.body.dryRun)
    });

    await logAdminAction({
      req,
      action: req.body.dryRun ? "reminder_campaign.previewed" : "reminder_campaign.ran",
      entityType: "ReminderCampaign",
      entityId: campaign._id,
      summary: `${req.body.dryRun ? "Previewed" : "Ran"} reminder campaign ${campaign.name}`,
      metadata: {
        campaignId: campaign._id,
        matchedCount: result.summary.matchedCount,
        notificationCount: result.summary.notificationCount,
        emailAttemptCount: result.summary.emailAttemptCount,
        dryRun: result.summary.dryRun
      }
    });

    res.status(req.body.dryRun ? 200 : 201).json({
      campaign,
      ...result
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }

    console.error("Error running reminder campaign:", err);
    res.status(500).json({ error: "Server error" });
  }
};
