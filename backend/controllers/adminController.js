const Student = require("../models/Student");

// Get all students (admin only)
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select("-password");
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Create a new student (admin only)
exports.createStudent = async (req, res) => {
  try {
    const { name, email, registrationNo, department } = req.body;

    if (!name || !email || !registrationNo || !department) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const studentExists = await Student.findOne({ email });
    if (studentExists) {
      return res.status(400).json({ error: "Student with this email already exists" });
    }

    const student = await Student.create({
      name,
      email,
      registrationNo,
      department,
      password: registrationNo, // Default password
      role: "student"
    });

    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
