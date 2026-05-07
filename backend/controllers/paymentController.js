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

    const assignment = await FeeAssignment.findOne({
      _id: assignmentId,
      institutionId: req.institutionId,
      studentId: req.user._id
    }).populate("feeId", "amount title");

    if (!assignment || !assignment.feeId) {
      return res.status(404).json({ success: false, message: "Fee assignment not found" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Update Payment in DB
      const payment = await Payment.create({
        institutionId: req.institutionId,
        studentId: req.user._id,
        assignmentId,
        amount: assignment.feeId.amount,
        mode: "online",
        status: "completed",
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature,
      });

      await FeeAssignment.findOneAndUpdate(
        { _id: assignmentId, institutionId: req.institutionId, studentId: req.user._id },
        { status: "paid" }
      );

      // Generate receipt and send email
      try {
        const filePath = await generateReceipt(req.user, assignmentId, payment);
        await sendReceiptEmail(req.user, filePath);
      } catch (receiptError) {
        console.error("Receipt generation error:", receiptError);
        // Don't fail the payment if receipt generation fails
      }

      // Create notification
      try {
        const Notification = require("../models/Notification");
        await Notification.create({
          institutionId: req.institutionId,
          studentId: req.user._id,
          title: "Payment Successful",
          message: `Your payment of INR ${assignment.feeId.amount} has been processed successfully. Receipt has been sent to your email.`,
          type: "success",
          relatedPayment: payment._id
        });
      } catch (notificationError) {
        console.error("Notification creation error:", notificationError);
        // Don't fail the payment if notification creation fails
      }

      return res.json({ success: true, message: "Payment verified & receipt sent!" });
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
