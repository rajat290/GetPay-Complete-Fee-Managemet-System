const express = require("express");
const { createFee, assignFee, getStudentFees, getAllFees } = require("../controllers/feeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Only admin can create or assign fees
router.post("/create", protect, createFee);
router.post("/assign", protect, assignFee);

// Students can view their fees
router.get("/my-fees", protect, getStudentFees);

// Admin: View all created fees
router.get("/", protect, getAllFees);

module.exports = router;