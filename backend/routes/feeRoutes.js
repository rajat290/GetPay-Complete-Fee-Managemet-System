const express = require("express");
const { createFee, assignFee, getStudentFees, getAllFees, getAllFeeAssignments } = require("../controllers/feeController");
const { protect, requireAdmin, requireStudent } = require("../middleware/authMiddleware");

const router = express.Router();

// Only admin can create or assign fees
router.post("/create", protect, requireAdmin, createFee);
router.post("/assign", protect, requireAdmin, assignFee);

// Students can view their fees
router.get("/my-fees", protect, requireStudent, getStudentFees);

// Admin: View all created fees
router.get("/", protect, requireAdmin, getAllFees);

// Admin: View all fee assignments with student and fee info
router.get("/assignments", protect, requireAdmin, getAllFeeAssignments);

module.exports = router;
