const crypto = require("crypto");
const Payment = require("../models/Payment");
const PaymentEvent = require("../models/PaymentEvent");
const FeeAssignment = require("../models/FeeAssignment");
const Student = require("../models/Student");
const Notification = require("../models/Notification");
const generateReceipt = require("../utils/receiptGenerator");
const sendReceiptEmail = require("../utils/emailService");
const logger = require("../utils/logger");

const verifyCheckoutSignature = ({ orderId, paymentId, signature }) => {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(signature || "");
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
};

const verifyWebhookSignature = ({ rawBody, signature }) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured");
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(signature || "");
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
};

const logPaymentEvent = async ({
  payment,
  eventType,
  gatewayEventId,
  razorpayOrderId,
  razorpayPaymentId,
  payload,
  source
}) => {
  try {
    return await PaymentEvent.create({
      institutionId: payment?.institutionId,
      paymentId: payment?._id,
      eventType,
      gatewayEventId,
      razorpayOrderId,
      razorpayPaymentId,
      payload,
      source
    });
  } catch (error) {
    if (error.code === 11000) return null;
    throw error;
  }
};

const hasProcessedGatewayEvent = async ({ gatewayEventId, source = "webhook" }) => {
  if (!gatewayEventId) return false;
  return Boolean(await PaymentEvent.exists({ gatewayEventId, source }));
};

const markAssignmentPaid = async (payment) => {
  await FeeAssignment.findOneAndUpdate(
    {
      _id: payment.assignmentId,
      institutionId: payment.institutionId,
      studentId: payment.studentId
    },
    { status: "paid" }
  );
};

const sendSuccessSideEffects = async (payment) => {
  const student = await Student.findOne({
    _id: payment.studentId,
    institutionId: payment.institutionId
  });

  if (!student) return;

  try {
    const filePath = await generateReceipt(student, payment.assignmentId, payment);
    await sendReceiptEmail(student, filePath);
  } catch (error) {
    logger.error("receipt_generation_failed", { error, paymentId: payment._id, institutionId: payment.institutionId });
  }

  try {
    await Notification.create({
      institutionId: payment.institutionId,
      studentId: payment.studentId,
      title: "Payment Successful",
      message: `Your payment of INR ${payment.amount} has been processed successfully. Receipt has been sent to your email.`,
      type: "success",
      relatedPayment: payment._id
    });
  } catch (error) {
    logger.error("payment_notification_creation_failed", { error, paymentId: payment._id, institutionId: payment.institutionId });
  }
};

const completePayment = async ({
  payment,
  razorpayPaymentId,
  razorpayOrderId,
  razorpaySignature,
  gatewayStatus = "captured",
  payload,
  source,
  gatewayEventId
}) => {
  if (payment.status === "completed") {
    await logPaymentEvent({
      payment,
      eventType: "payment.completed.duplicate",
      gatewayEventId,
      razorpayOrderId,
      razorpayPaymentId,
      payload,
      source
    });
    return { payment, alreadyProcessed: true };
  }

  payment.status = "completed";
  payment.gatewayStatus = gatewayStatus;
  payment.razorpayPaymentId = razorpayPaymentId || payment.razorpayPaymentId;
  payment.razorpayOrderId = razorpayOrderId || payment.razorpayOrderId;
  payment.razorpaySignature = razorpaySignature || payment.razorpaySignature;
  payment.verifiedAt = new Date();
  await payment.save();

  await markAssignmentPaid(payment);
  await logPaymentEvent({
    payment,
    eventType: "payment.completed",
    gatewayEventId,
    razorpayOrderId: payment.razorpayOrderId,
    razorpayPaymentId: payment.razorpayPaymentId,
    payload,
    source
  });
  await sendSuccessSideEffects(payment);

  return { payment, alreadyProcessed: false };
};

const failPayment = async ({
  payment,
  razorpayPaymentId,
  razorpayOrderId,
  failureReason,
  payload,
  source,
  gatewayEventId
}) => {
  if (payment.status === "completed") {
    return { payment, ignored: true };
  }

  payment.status = "failed";
  payment.gatewayStatus = "failed";
  payment.razorpayPaymentId = razorpayPaymentId || payment.razorpayPaymentId;
  payment.razorpayOrderId = razorpayOrderId || payment.razorpayOrderId;
  payment.failureReason = failureReason || "Payment failed";
  await payment.save();

  await logPaymentEvent({
    payment,
    eventType: "payment.failed",
    gatewayEventId,
    razorpayOrderId: payment.razorpayOrderId,
    razorpayPaymentId: payment.razorpayPaymentId,
    payload,
    source
  });

  return { payment, ignored: false };
};

module.exports = {
  verifyCheckoutSignature,
  verifyWebhookSignature,
  logPaymentEvent,
  hasProcessedGatewayEvent,
  completePayment,
  failPayment
};
