const crypto = require("crypto");
const razorpayInstance = require("../config/razorpay");
const Payment = require("../models/Payment");
const FeeAssignment = require("../models/FeeAssignment");
const generateReceipt = require("../utils/receiptGenerator");
const sendReceiptEmail = require("../utils/emailService");

// 1. Create Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const { amount, assignmentId } = req.body;

    if (!amount || !assignmentId) {
      return res.status(400).json({ message: "Amount and assignmentId required" });
    }

    const options = {
      amount: amount * 100, // Razorpay needs paise (1 INR = 100 paise)
      currency: "INR",
      receipt: `rcpt_${assignmentId}`,
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({
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

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Update Payment in DB
      await Payment.create({
        studentId: req.user._id,
        assignmentId,
        amount: req.body.amount,
        mode: "online",
        status: "success",
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature,
      });

      await FeeAssignment.findByIdAndUpdate(assignmentId, { status: "paid" });

      return res.json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// if (expectedSignature === razorpay_signature) {
//   const payment = await Payment.create({
//     studentId: req.user._id,
//     assignmentId,
//     amount: req.body.amount,
//     mode: "online",
//     status: "success",
//     razorpayPaymentId: razorpay_payment_id,
//     razorpayOrderId: razorpay_order_id,
//     razorpaySignature: razorpay_signature,
//   });

//   await FeeAssignment.findByIdAndUpdate(assignmentId, { status: "paid" });

//   const filePath = generateReceipt(req.user, assignmentId, payment);
//   await sendReceiptEmail(req.user, filePath);

//   return res.json({ success: true, message: "Payment verified & receipt sent!" });
// }