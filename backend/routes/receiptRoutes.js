const express = require("express");
const { protect, requireStudent } = require("../middleware/authMiddleware");
const { requireModule } = require("../middleware/moduleAccessMiddleware");
const { getReceipts, downloadReceipt } = require("../controllers/receiptController");

const router = express.Router();

// Get all receipts for student
router.get("/", protect, requireStudent, requireModule("fee_management"), getReceipts);

// Download a specific receipt
router.get("/download/:paymentId", protect, requireStudent, requireModule("fee_management"), downloadReceipt);

module.exports = router;
