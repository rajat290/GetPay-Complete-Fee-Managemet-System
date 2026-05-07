const Institution = require("../../models/Institution");
const Student = require("../../models/Student");
const Fee = require("../../models/Fee");
const FeeAssignment = require("../../models/FeeAssignment");
const Payment = require("../../models/Payment");
const PaymentEvent = require("../../models/PaymentEvent");
const {
  completePayment,
  failPayment
} = require("../../services/paymentLifecycleService");

jest.mock("../../utils/receiptGenerator", () => jest.fn(async () => "receipt.pdf"));
jest.mock("../../utils/emailService", () => jest.fn(async () => ({ accepted: ["test@example.com"] })));

describe("paymentLifecycleService", () => {
  let institution;
  let student;
  let assignment;
  let payment;

  beforeEach(async () => {
    institution = await Institution.create({
      name: "Test Institution",
      code: "TEST-INST"
    });

    student = await Student.create({
      institutionId: institution._id,
      name: "Test Student",
      email: "test@example.com",
      password: "password",
      registrationNo: "STD001",
      className: "10A"
    });

    const fee = await Fee.create({
      institutionId: institution._id,
      title: "Tuition Fee",
      amount: 1000,
      category: "Tuition",
      dueDate: new Date("2026-12-31")
    });

    assignment = await FeeAssignment.create({
      institutionId: institution._id,
      studentId: student._id,
      feeId: fee._id,
      dueDate: new Date("2026-12-31"),
      status: "pending"
    });

    payment = await Payment.create({
      institutionId: institution._id,
      studentId: student._id,
      assignmentId: assignment._id,
      amount: fee.amount,
      mode: "online",
      status: "pending",
      razorpayOrderId: "order_test"
    });
  });

  it("completes a pending payment and marks assignment paid", async () => {
    const result = await completePayment({
      payment,
      razorpayPaymentId: "pay_test",
      razorpayOrderId: "order_test",
      razorpaySignature: "sig_test",
      source: "checkout_verify",
      payload: { ok: true }
    });

    const updatedPayment = await Payment.findById(payment._id);
    const updatedAssignment = await FeeAssignment.findById(assignment._id);
    const events = await PaymentEvent.find({ paymentId: payment._id });

    expect(result.alreadyProcessed).toBe(false);
    expect(updatedPayment.status).toBe("completed");
    expect(updatedPayment.verifiedAt).toBeDefined();
    expect(updatedAssignment.status).toBe("paid");
    expect(events.map((event) => event.eventType)).toContain("payment.completed");
  });

  it("is idempotent when completing an already completed payment", async () => {
    await completePayment({
      payment,
      razorpayPaymentId: "pay_test",
      razorpayOrderId: "order_test",
      source: "checkout_verify"
    });

    const updatedPayment = await Payment.findById(payment._id);
    const result = await completePayment({
      payment: updatedPayment,
      razorpayPaymentId: "pay_test",
      razorpayOrderId: "order_test",
      source: "checkout_verify"
    });

    expect(result.alreadyProcessed).toBe(true);
    expect(await Payment.countDocuments({ razorpayPaymentId: "pay_test" })).toBe(1);
  });

  it("marks pending payments as failed without changing paid assignments", async () => {
    await failPayment({
      payment,
      razorpayPaymentId: "pay_failed",
      razorpayOrderId: "order_test",
      failureReason: "Card declined",
      source: "webhook",
      payload: { failed: true }
    });

    const updatedPayment = await Payment.findById(payment._id);
    const updatedAssignment = await FeeAssignment.findById(assignment._id);

    expect(updatedPayment.status).toBe("failed");
    expect(updatedPayment.failureReason).toBe("Card declined");
    expect(updatedAssignment.status).toBe("pending");
  });
});
