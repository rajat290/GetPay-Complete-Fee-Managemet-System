const express = require("express");
const { protect, requireStudent } = require("../middleware/authMiddleware");
const { getReceipts, downloadReceipt } = require("../controllers/receiptController");

const router = express.Router();

// Get all receipts for student
router.get("/", protect, requireStudent, getReceipts);

// Download a specific receipt
router.get("/download/:paymentId", protect, requireStudent, downloadReceipt);

module.exports = router;
