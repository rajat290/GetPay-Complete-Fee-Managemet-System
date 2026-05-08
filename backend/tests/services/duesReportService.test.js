const Institution = require("../../models/Institution");
const Student = require("../../models/Student");
const Fee = require("../../models/Fee");
const FeeAssignment = require("../../models/FeeAssignment");
const Payment = require("../../models/Payment");
const {
  refreshOverdueAssignments,
  buildDuesReport
} = require("../../services/duesReportService");

describe("duesReportService", () => {
  let institution;
  let studentA;
  let studentB;
  let pendingAssignment;
  let overdueAssignment;

  beforeEach(async () => {
    institution = await Institution.create({
      name: "Test Institution",
      code: "TEST-INST"
    });

    studentA = await Student.create({
      institutionId: institution._id,
      name: "Student A",
      email: "a@example.com",
      password: "password",
      registrationNo: "STD001",
      className: "10A"
    });

    studentB = await Student.create({
      institutionId: institution._id,
      name: "Student B",
      email: "b@example.com",
      password: "password",
      registrationNo: "STD002",
      className: "11A"
    });

    const fees = await Fee.create([
      {
        institutionId: institution._id,
        title: "Pending Fee",
        amount: 1000,
        category: "Tuition",
        dueDate: new Date("2026-12-31")
      },
      {
        institutionId: institution._id,
        title: "Overdue Fee",
        amount: 800,
        category: "Other",
        dueDate: new Date("2020-01-01")
      }
    ]);

    pendingAssignment = await FeeAssignment.create({
      institutionId: institution._id,
      studentId: studentA._id,
      feeId: fees[0]._id,
      dueDate: new Date("2026-12-31"),
      status: "pending"
    });

    overdueAssignment = await FeeAssignment.create({
      institutionId: institution._id,
      studentId: studentB._id,
      feeId: fees[1]._id,
      dueDate: new Date("2020-01-01"),
      status: "overdue"
    });

    await Payment.create({
      institutionId: institution._id,
      studentId: studentA._id,
      assignmentId: pendingAssignment._id,
      amount: 300,
      mode: "cash",
      gateway: "manual",
      status: "completed"
    });
  });

  it("builds pending and overdue dues report with balances", async () => {
    const report = await buildDuesReport({
      institutionId: institution._id,
      filters: {}
    });

    expect(report.summary.assignmentCount).toBe(2);
    expect(report.summary.studentCount).toBe(2);
    expect(report.summary.totalDueAmount).toBe(1500);
    expect(report.summary.pendingAmount).toBe(700);
    expect(report.summary.overdueAmount).toBe(800);
    expect(report.rows).toHaveLength(2);
  });

  it("filters dues by class and status", async () => {
    const report = await buildDuesReport({
      institutionId: institution._id,
      filters: {
        className: "11A",
        status: "overdue"
      }
    });

    expect(report.summary.assignmentCount).toBe(1);
    expect(report.summary.overdueAmount).toBe(800);
    expect(report.rows[0].student.className).toBe("11A");
  });

  it("refreshes pending assignments past their due date", async () => {
    const result = await refreshOverdueAssignments({
      institutionId: institution._id,
      asOfDate: new Date("2027-01-01")
    });

    const updated = await FeeAssignment.findById(pendingAssignment._id);
    const alreadyOverdue = await FeeAssignment.findById(overdueAssignment._id);

    expect(result.modifiedCount).toBe(1);
    expect(updated.status).toBe("overdue");
    expect(alreadyOverdue.status).toBe("overdue");
  });
});
