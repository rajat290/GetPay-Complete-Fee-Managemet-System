const express = require("express");
const { createFee, assignFee, bulkAssignFee, getStudentFees, getAllFees, getAllFeeAssignments, getMyLedger } = require("../controllers/feeController");
const { protect, requireAdmin, requireStudent } = require("../middleware/authMiddleware");
const { requireModule } = require("../middleware/moduleAccessMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { createFeeSchema, assignFeeSchema, bulkAssignFeeSchema } = require("../validators/feeValidators");

const router = express.Router();

// Only admin can create or assign fees
router.post("/create", protect, requireAdmin, requireModule("fee_management"), validateRequest(createFeeSchema), createFee);
router.post("/assign", protect, requireAdmin, requireModule("fee_management"), validateRequest(assignFeeSchema), assignFee);
router.post("/assign-bulk", protect, requireAdmin, requireModule("fee_management"), validateRequest(bulkAssignFeeSchema), bulkAssignFee);

// Students can view their fees
router.get("/my-fees", protect, requireStudent, requireModule("fee_management"), getStudentFees);
router.get("/my-ledger", protect, requireStudent, requireModule("fee_management"), getMyLedger);

// Admin: View all created fees
router.get("/", protect, requireAdmin, requireModule("fee_management"), getAllFees);

// Admin: View all fee assignments with student and fee info
router.get("/assignments", protect, requireAdmin, requireModule("fee_management"), getAllFeeAssignments);

module.exports = router;
