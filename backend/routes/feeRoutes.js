const express = require("express");
const { createFee, assignFee, bulkAssignFee, getStudentFees, getAllFees, getAllFeeAssignments, getMyLedger } = require("../controllers/feeController");
const { protect, requireAdmin, requireStudent } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { createFeeSchema, assignFeeSchema, bulkAssignFeeSchema } = require("../validators/feeValidators");

const router = express.Router();

// Only admin can create or assign fees
router.post("/create", protect, requireAdmin, validateRequest(createFeeSchema), createFee);
router.post("/assign", protect, requireAdmin, validateRequest(assignFeeSchema), assignFee);
router.post("/assign-bulk", protect, requireAdmin, validateRequest(bulkAssignFeeSchema), bulkAssignFee);

// Students can view their fees
router.get("/my-fees", protect, requireStudent, getStudentFees);
router.get("/my-ledger", protect, requireStudent, getMyLedger);

// Admin: View all created fees
router.get("/", protect, requireAdmin, getAllFees);

// Admin: View all fee assignments with student and fee info
router.get("/assignments", protect, requireAdmin, getAllFeeAssignments);

module.exports = router;
