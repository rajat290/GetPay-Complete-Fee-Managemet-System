const Institution = require("../../models/Institution");
const Student = require("../../models/Student");
const Fee = require("../../models/Fee");
const FeeAssignment = require("../../models/FeeAssignment");
const Payment = require("../../models/Payment");
const { buildStudentLedger } = require("../../services/studentLedgerService");

describe("studentLedgerService", () => {
  let institution;
  let student;

  beforeEach(async () => {
    institution = await Institution.create({
      name: "Test Institution",
      code: "TEST-INST"
    });

    student = await Student.create({
      institutionId: institution._id,
      name: "Student User",
      email: "student@example.com",
      password: "password",
      registrationNo: "STD001",
      className: "10A"
    });
  });

  it("builds paid, pending, and overdue ledger rows", async () => {
    const paidFee = await Fee.create({
      institutionId: institution._id,
      title: "Paid Fee",
      amount: 1000,
      category: "Tuition",
      dueDate: new Date("2026-12-31")
    });
    const pendingFee = await Fee.create({
      institutionId: institution._id,
      title: "Pending Fee",
      amount: 500,
      category: "Other",
      dueDate: new Date("2026-12-31")
    });
    const overdueFee = await Fee.create({
      institutionId: institution._id,
      title: "Overdue Fee",
      amount: 300,
      category: "Other",
      dueDate: new Date("2020-01-01")
    });

    const paidAssignment = await FeeAssignment.create({
      institutionId: institution._id,
      studentId: student._id,
      feeId: paidFee._id,
      dueDate: new Date("2026-12-31"),
      status: "paid"
    });
    await FeeAssignment.create({
      institutionId: institution._id,
      studentId: student._id,
      feeId: pendingFee._id,
      dueDate: new Date("2026-12-31"),
      status: "pending"
    });
    await FeeAssignment.create({
      institutionId: institution._id,
      studentId: student._id,
      feeId: overdueFee._id,
      dueDate: new Date("2020-01-01"),
      status: "pending"
    });

    await Payment.create({
      institutionId: institution._id,
      studentId: student._id,
      assignmentId: paidAssignment._id,
      amount: 1000,
      mode: "cash",
      gateway: "manual",
      status: "completed"
    });

    const ledger = await buildStudentLedger({
      institutionId: institution._id,
      studentId: student._id
    });

    expect(ledger.summary.assignedAmount).toBe(1800);
    expect(ledger.summary.paidAmount).toBe(1000);
    expect(ledger.summary.pendingAmount).toBe(800);
    expect(ledger.summary.overdueAmount).toBe(300);
    expect(ledger.summary.paidCount).toBe(1);
    expect(ledger.summary.pendingCount).toBe(1);
    expect(ledger.summary.overdueCount).toBe(1);
    expect(ledger.rows.map((row) => row.ledgerStatus).sort()).toEqual(["overdue", "paid", "pending"]);
  });
});
