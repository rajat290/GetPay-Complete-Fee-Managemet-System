const express = require("express");
const { createFee, assignFee, bulkAssignFee, getStudentFees, getAllFees, getAllFeeAssignments, getMyLedger } = require("../controllers/feeController");
const { protect, requireAdminOrStaff, requireStudent } = require("../middleware/authMiddleware");
const { requireModule } = require("../middleware/moduleAccessMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { createFeeSchema, assignFeeSchema, bulkAssignFeeSchema } = require("../validators/feeValidators");

const router = express.Router();

// Only admin can create or assign fees
router.post("/create", protect, requireAdminOrStaff, requireModule("fee_management"), requirePermission("fee.create"), validateRequest(createFeeSchema), createFee);
router.post("/assign", protect, requireAdminOrStaff, requireModule("fee_management"), requirePermission("fee.assign"), validateRequest(assignFeeSchema), assignFee);
router.post("/assign-bulk", protect, requireAdminOrStaff, requireModule("fee_management"), requirePermission("fee.assign"), validateRequest(bulkAssignFeeSchema), bulkAssignFee);

// Students can view their fees
router.get("/my-fees", protect, requireStudent, requireModule("fee_management"), getStudentFees);
router.get("/my-ledger", protect, requireStudent, requireModule("fee_management"), getMyLedger);

// Admin: View all created fees
router.get("/", protect, requireAdminOrStaff, requireModule("fee_management"), requirePermission("fee.view"), getAllFees);

// Admin: View all fee assignments with student and fee info
router.get("/assignments", protect, requireAdminOrStaff, requireModule("fee_management"), requirePermission("fee.view"), getAllFeeAssignments);

module.exports = router;
