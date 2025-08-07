const Student = require("../models/Student");

// Get all students (admin only)
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select("-password");
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
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

    // Check for existing student by email or registrationNo
    const studentExists = await Student.findOne({
      $or: [{ email }, { registrationNo }]
    });
    if (studentExists) {
      return res.status(400).json({ error: "Student with this email or registration number already exists" });
    }

    // Create new student
    const student = new Student({
      name,
      email,
      registrationNo,
      department,
      password: registrationNo, // Default password
      role: "student"
    });

    await student.save();

    // Remove password from response
    const studentObj = student.toObject();
    delete studentObj.password;

    res.status(201).json(studentObj);
  } catch (err) {
    console.error("Error creating student:", err);
    // Handle duplicate key error (in case of race condition)
    if (err.code === 11000) {
      return res.status(400).json({ error: "Student with this email or registration number already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};
