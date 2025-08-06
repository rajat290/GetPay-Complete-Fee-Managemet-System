const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getReceipts } = require("../controllers/receiptController");

router.get("/", protect, getReceipts);

module.exports = router;
