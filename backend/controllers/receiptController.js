const Receipt = require("../models/Receipt");
const Payment = require("../models/Payment");
const fs = require("fs");
const path = require("path");

// Get all receipts for a student
exports.getReceipts = async (req, res) => {
  try {
    const payments = await Payment.find({ studentId: req.user._id, status: "completed" })
      .populate({
        path: "assignmentId",
        populate: { path: "feeId", select: "title" }
      })
      .sort({ createdAt: -1 });

    const receipts = payments.map(payment => ({
      _id: payment._id,
      amount: payment.amount,
      createdAt: payment.createdAt,
      feeTitle: payment.assignmentId?.feeId?.title || "Fee Payment",
      razorpayPaymentId: payment.razorpayPaymentId,
      status: payment.status
    }));

    res.json(receipts);
  } catch (error) {
    console.error("Error fetching receipts:", error);
    res.status(500).json({ message: "Error fetching receipts" });
  }
};

// Download a specific receipt PDF
exports.downloadReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Verify the payment belongs to the student
    const payment = await Payment.findOne({ 
      _id: paymentId, 
      studentId: req.user._id,
      status: "completed"
    });

    if (!payment) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    const filePath = path.join(__dirname, `../receipts/receipt_${paymentId}.pdf`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Receipt file not found" });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt_${paymentId}.pdf"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading receipt:", error);
    res.status(500).json({ message: "Error downloading receipt" });
  }
};
