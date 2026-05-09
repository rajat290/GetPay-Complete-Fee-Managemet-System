const Fee = require("../models/Fee");
const FeeAssignment = require("../models/FeeAssignment");
const Student = require("../models/Student");
const { buildStudentLedger } = require("../services/studentLedgerService");
const { logAdminAction } = require("../services/auditLogService");

const isAdminOrStaff = (user) => ["admin", "staff"].includes(user?.role);

// Admin: Create a new Fee
exports.createFee = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    if (!isAdminOrStaff(req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, amount, category, dueDate } = req.body;
    if (!title || !amount || !category || !dueDate) {
      return res.status(400).json({ message: "All fields required" });
    }

    const fee = await Fee.create({
      institutionId: req.institutionId,
      title,
      amount,
      category,
      dueDate
    });

    await logAdminAction({
      req,
      action: "fee.created",
      entityType: "Fee",
      entityId: fee._id,
      summary: `Created fee ${fee.title}`,
      metadata: {
        feeId: fee._id,
        title,
        amount,
        category,
        dueDate
      }
    });

    res.status(201).json(fee);
  } catch (err) {
    console.error("Error creating fee:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Assign Fee to a Student
exports.assignFee = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    if (!isAdminOrStaff(req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { studentId, feeId, dueDate, amount, installmentName } = req.body;
    if (!studentId || !feeId || !dueDate) {
      return res.status(400).json({ message: "All fields required" });
    }

    const [fee, student] = await Promise.all([
      Fee.findOne({ _id: feeId, institutionId: req.institutionId }),
      Student.findOne({ _id: studentId, institutionId: req.institutionId })
    ]);

    if (!fee || !student) {
      return res.status(404).json({ message: "Student or fee not found for this institution" });
    }

    const assignment = await FeeAssignment.create({
      institutionId: req.institutionId,
      studentId,
      feeId,
      feeTitle: fee.title,
      amount: amount || fee.amount,
      installmentName: installmentName || 'Full Payment',
      dueDate,
      status: "pending"
    });

    await logAdminAction({
      req,
      action: "fee.assigned",
      entityType: "FeeAssignment",
      entityId: assignment._id,
      summary: `Assigned ${fee.title} to ${student.name}`,
      metadata: {
        assignmentId: assignment._id,
        feeId,
        studentId,
        dueDate,
        amount: assignment.amount,
        installmentName: assignment.installmentName
      }
    });

    res.status(201).json(assignment);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "This fee/installment is already assigned to this student" });
    }
    console.error("Error assigning fee:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Student: Get My Fees
exports.getStudentFees = async (req, res) => {
  try {
    const assignments = await FeeAssignment.find({
        institutionId: req.institutionId,
        studentId: req.user._id
      })
      .populate("feeId", "category")
      .sort({ dueDate: 1 });

    // Flatten the structure for frontend
    const formatted = assignments.map((a) => ({
      _id: a._id,
      title: a.installmentName && a.installmentName !== 'Full Payment' ? `${a.feeTitle} (${a.installmentName})` : a.feeTitle,
      amount: a.amount,
      category: a.feeId?.category || "Other",
      dueDate: a.dueDate,
      status: a.status,
      installmentName: a.installmentName
    }));
    res.json(formatted);
  } catch (err) {
    console.error("Error fetching student fees:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: View All Fees
exports.getAllFees = async (req, res) => {
  try {
    if (!isAdminOrStaff(req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const fees = await Fee.find({ institutionId: req.institutionId });
    res.json(fees);
  } catch (err) {
    console.error("Error fetching fees:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get all fee assignments with student and fee info
exports.getAllFeeAssignments = async (req, res) => {
  try {
    if (!isAdminOrStaff(req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const assignments = await FeeAssignment.find({ institutionId: req.institutionId })
      .populate('studentId', 'name registrationNo')
      .sort({ dueDate: 1 });

    // Format for frontend
    const formatted = assignments.map(a => ({
      _id: a._id,
      student: a.studentId ? { name: a.studentId.name, registrationNo: a.studentId.registrationNo } : null,
      feeTitle: a.installmentName && a.installmentName !== 'Full Payment' ? `${a.feeTitle} (${a.installmentName})` : a.feeTitle,
      amount: a.amount,
      dueDate: a.dueDate,
      status: a.status,
      installmentName: a.installmentName
    }));
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching fee assignments:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin: Bulk assign a fee to selected students or an entire class
exports.bulkAssignFee = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!isAdminOrStaff(req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { feeId, dueDate, className, studentIds = [], installments = [] } = req.body;

    if (!className && (!Array.isArray(studentIds) || studentIds.length === 0)) {
      return res.status(400).json({ message: "Provide className or studentIds" });
    }

    const fee = await Fee.findOne({ _id: feeId, institutionId: req.institutionId });
    if (!fee) {
      return res.status(404).json({ message: "Fee not found for this institution" });
    }

    const studentQuery = { institutionId: req.institutionId, role: "student" };
    if (className) studentQuery.className = className;
    if (Array.isArray(studentIds) && studentIds.length > 0) studentQuery._id = { $in: studentIds };

    const students = await Student.find(studentQuery).select("_id name");
    if (students.length === 0) return res.status(404).json({ message: "No matching students found" });

    // Prepare installment list
    const installmentList = installments.length > 0 
      ? installments 
      : [{ name: 'Full Payment', amount: fee.amount, dueDate: dueDate || fee.dueDate }];

    const studentIdsToAssign = students.map((student) => student._id);
    const installmentNames = installmentList.map((inst) => inst.name || "Full Payment");

    const existingAssignments = await FeeAssignment.find({
      institutionId: req.institutionId,
      feeId,
      studentId: { $in: studentIdsToAssign },
      installmentName: { $in: installmentNames }
    }).select("studentId installmentName");

    const existingKeys = new Set(
      existingAssignments.map((assignment) => `${assignment.studentId.toString()}::${assignment.installmentName}`)
    );

    const assignmentsToCreate = [];
    let skippedCount = 0;

    for (const student of students) {
      for (const inst of installmentList) {
        const installmentName = inst.name || "Full Payment";
        const key = `${student._id.toString()}::${installmentName}`;
        if (existingKeys.has(key)) {
          skippedCount++;
          continue;
        }

        assignmentsToCreate.push({
          institutionId: req.institutionId,
          academicSessionId: fee.academicSessionId,
          studentId: student._id,
          feeId,
          feeTitle: fee.title,
          amount: inst.amount || fee.amount,
          installmentName,
          dueDate: inst.dueDate || dueDate || fee.dueDate,
          status: "pending"
        });
      }
    }

    const createdAssignments = assignmentsToCreate.length > 0
      ? await FeeAssignment.insertMany(assignmentsToCreate, { ordered: false })
      : [];

    await logAdminAction({
      req,
      action: "fee.bulk_assigned",
      entityType: "FeeAssignment",
      entityId: fee._id,
      summary: `Bulk assigned ${fee.title} to ${createdAssignments.length} students`,
      metadata: {
        feeId,
        className: className || null,
        requestedStudentIds: studentIds,
        matchedStudents: students.length,
        createdCount: createdAssignments.length,
        skippedCount,
        installmentCount: installmentList.length,
        createdAssignmentIds: createdAssignments.map((assignment) => assignment._id),
        skippedStudentIds: existingAssignments.map((assignment) => assignment.studentId)
      }
    });

    res.status(201).json({
      message: "Bulk assignment completed",
      matchedStudents: students.length,
      createdCount: createdAssignments.length,
      skippedCount,
      createdAssignmentIds: createdAssignments.map((assignment) => assignment._id),
      skippedStudentIds: existingAssignments.map((assignment) => assignment.studentId.toString())
    });
  } catch (err) {
    console.error("Error bulk assigning fee:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Student: Get my complete fee ledger
exports.getMyLedger = async (req, res) => {
  try {
    const ledger = await buildStudentLedger({
      institutionId: req.institutionId,
      studentId: req.user._id
    });

    res.json(ledger);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }

    console.error("Error fetching student ledger:", err);
    res.status(500).json({ message: "Server error" });
  }
};
