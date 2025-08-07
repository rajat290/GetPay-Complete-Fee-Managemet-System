const express = require("express");
const { getAllStudents, createStudent } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /admin/students - Get all students (admin only)
router.get("/students", protect, getAllStudents);

// POST /admin/students - Create a new student (admin only)
router.post("/students", protect, createStudent);

module.exports = router;
