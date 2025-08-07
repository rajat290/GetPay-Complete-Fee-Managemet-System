const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getReceipts, downloadReceipt } = require("../controllers/receiptController");

const router = express.Router();

// Get all receipts for student
router.get("/", protect, getReceipts);

// Download a specific receipt
router.get("/download/:paymentId", protect, downloadReceipt);

module.exports = router;
