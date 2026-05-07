const Institution = require("../../models/Institution");
const Student = require("../../models/Student");
const Fee = require("../../models/Fee");
const FeeAssignment = require("../../models/FeeAssignment");
const Payment = require("../../models/Payment");
const { buildPaymentReconciliationReport } = require("../../services/paymentReportService");

describe("paymentReportService", () => {
  let institution;
  let studentA;
  let studentB;
  let assignmentA;
  let assignmentB;
  let assignmentC;

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

    const fee = await Fee.create({
      institutionId: institution._id,
      title: "Tuition Fee",
      amount: 1000,
      category: "Tuition",
      dueDate: new Date("2026-12-31")
    });

    assignmentA = await FeeAssignment.create({
      institutionId: institution._id,
      studentId: studentA._id,
      feeId: fee._id,
      dueDate: new Date("2026-12-31")
    });

    assignmentB = await FeeAssignment.create({
      institutionId: institution._id,
      studentId: studentA._id,
      feeId: fee._id,
      dueDate: new Date("2026-12-31")
    });

    assignmentC = await FeeAssignment.create({
      institutionId: institution._id,
      studentId: studentB._id,
      feeId: fee._id,
      dueDate: new Date("2026-12-31")
    });

    await Payment.create([
      {
        institutionId: institution._id,
        studentId: studentA._id,
        assignmentId: assignmentA._id,
        amount: 1000,
        mode: "online",
        gateway: "razorpay",
        status: "completed",
        razorpayOrderId: "order_1",
        razorpayPaymentId: "pay_1"
      },
      {
        institutionId: institution._id,
        studentId: studentA._id,
        assignmentId: assignmentB._id,
        amount: 1000,
        mode: "cash",
        gateway: "manual",
        status: "completed",
        referenceNo: "CASH-1"
      },
      {
        institutionId: institution._id,
        studentId: studentB._id,
        assignmentId: assignmentC._id,
        amount: 1000,
        mode: "online",
        gateway: "razorpay",
        status: "failed",
        razorpayOrderId: "order_2",
        failureReason: "Failed"
      }
    ]);
  });

  it("summarizes completed, failed, gateway, and manual payments", async () => {
    const report = await buildPaymentReconciliationReport({
      institutionId: institution._id,
      filters: {}
    });

    expect(report.summary.count).toBe(3);
    expect(report.summary.totalAmount).toBe(3000);
    expect(report.summary.completedCount).toBe(2);
    expect(report.summary.completedAmount).toBe(2000);
    expect(report.summary.failedCount).toBe(1);
    expect(report.byGateway.razorpay.count).toBe(2);
    expect(report.byGateway.manual.count).toBe(1);
    expect(report.byMode.cash.completedAmount).toBe(1000);
    expect(report.rows).toHaveLength(3);
  });

  it("filters reconciliation rows by class and status", async () => {
    const report = await buildPaymentReconciliationReport({
      institutionId: institution._id,
      filters: {
        className: "10A",
        status: "completed"
      }
    });

    expect(report.summary.count).toBe(2);
    expect(report.rows.every((row) => row.student.className === "10A")).toBe(true);
    expect(report.rows.every((row) => row.status === "completed")).toBe(true);
  });
});
