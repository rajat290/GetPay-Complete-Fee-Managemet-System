const razorpayInstance = require("../config/razorpay");
const Payment = require("../models/Payment");
const FeeAssignment = require("../models/FeeAssignment");
const {
  verifyCheckoutSignature,
  verifyWebhookSignature,
  logPaymentEvent,
  completePayment,
  failPayment
} = require("../services/paymentLifecycleService");

// 1. Create Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const { amount, assignmentId } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ message: "assignmentId required" });
    }

    const assignment = await FeeAssignment.findOne({
      _id: assignmentId,
      institutionId: req.institutionId,
      studentId: req.user._id
    }).populate("feeId", "amount title");

    if (!assignment || !assignment.feeId) {
      return res.status(404).json({ message: "Fee assignment not found" });
    }

    if (assignment.status === "paid") {
      return res.status(400).json({ message: "Fee assignment is already paid" });
    }

    const payableAmount = assignment.feeId.amount;

    if (amount && Number(amount) !== payableAmount) {
      return res.status(400).json({ message: "Payment amount does not match assigned fee" });
    }

    const options = {
      amount: payableAmount * 100, // Razorpay needs paise (1 INR = 100 paise)
      currency: "INR",
      receipt: `rcpt_${assignmentId}`,
    };

    const order = await razorpayInstance.orders.create(options);

    const payment = await Payment.create({
      institutionId: req.institutionId,
      studentId: req.user._id,
      assignmentId,
      amount: payableAmount,
      currency: order.currency,
      mode: "online",
      status: "pending",
      gateway: "razorpay",
      gatewayStatus: order.status,
      razorpayOrderId: order.id
    });

    await logPaymentEvent({
      payment,
      eventType: "order.created",
      razorpayOrderId: order.id,
      payload: order,
      source: "checkout_verify"
    });

    res.json({
      paymentId: payment._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      assignmentId,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 2. Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, assignmentId } = req.body;

    const assignment = await FeeAssignment.findOne({
      _id: assignmentId,
      institutionId: req.institutionId,
      studentId: req.user._id
    }).populate("feeId", "amount title");

    if (!assignment || !assignment.feeId) {
      return res.status(404).json({ success: false, message: "Fee assignment not found" });
    }

    if (!verifyCheckoutSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    })) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    let payment = await Payment.findOne({
      institutionId: req.institutionId,
      studentId: req.user._id,
      assignmentId,
      razorpayOrderId: razorpay_order_id
    });

    if (!payment) {
      payment = await Payment.findOne({
        razorpayPaymentId: razorpay_payment_id,
        institutionId: req.institutionId,
        studentId: req.user._id
      });
    }

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment order not found" });
    }

    if (payment.amount !== assignment.feeId.amount) {
      return res.status(409).json({ success: false, message: "Payment amount mismatch" });
    }

    const result = await completePayment({
      payment,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
      payload: req.body,
      source: "checkout_verify"
    });

    return res.json({
      success: true,
      alreadyProcessed: result.alreadyProcessed,
      message: result.alreadyProcessed ? "Payment already verified" : "Payment verified & receipt sent!"
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.body;

    if (!verifyWebhookSignature({ rawBody, signature })) {
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const event = JSON.parse(rawBody.toString("utf8"));
    const paymentEntity = event.payload?.payment?.entity;

    if (!paymentEntity?.order_id) {
      return res.status(200).json({ received: true, ignored: true });
    }

    const payment = await Payment.findOne({ razorpayOrderId: paymentEntity.order_id });

    if (!payment) {
      return res.status(200).json({ received: true, ignored: true });
    }

    if (event.event === "payment.captured" || paymentEntity.status === "captured") {
      await completePayment({
        payment,
        razorpayPaymentId: paymentEntity.id,
        razorpayOrderId: paymentEntity.order_id,
        gatewayStatus: paymentEntity.status,
        payload: event,
        source: "webhook",
        gatewayEventId: event.id
      });
    } else if (event.event === "payment.failed" || paymentEntity.status === "failed") {
      await failPayment({
        payment,
        razorpayPaymentId: paymentEntity.id,
        razorpayOrderId: paymentEntity.order_id,
        failureReason: paymentEntity.error_description || paymentEntity.error_reason,
        payload: event,
        source: "webhook",
        gatewayEventId: event.id
      });
    } else {
      await logPaymentEvent({
        payment,
        eventType: event.event || "payment.webhook.unhandled",
        gatewayEventId: event.id,
        razorpayOrderId: paymentEntity.order_id,
        razorpayPaymentId: paymentEntity.id,
        payload: event,
        source: "webhook"
      });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
};

// 3. Get Payment History for Student
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({
        institutionId: req.institutionId,
        studentId: req.user._id
      })
      .populate({
        path: "assignmentId",
        populate: { path: "feeId", select: "title" }
      })
      .sort({ createdAt: -1 });

    // Format response to include fee title
    const formatted = payments.map((p) => ({
      _id: p._id,
      amount: p.amount,
      status: p.status === 'completed' ? 'success' : p.status,
      createdAt: p.createdAt,
      feeTitle: p.assignmentId?.feeId?.title || "-"
    }));
    res.json(formatted);
  } catch (err) {
    console.error("Error fetching payment history:", err);
    res.status(500).json({ message: "Server error" });
  }
};
