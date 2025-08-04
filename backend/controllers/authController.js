const Student = require("../models/Student");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Register
exports.registerStudent = async (req, res) => {
  try {
    const { name, email, registrationNo, password, role } = req.body;

    if (!name || !email || !registrationNo || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const userExists = await Student.findOne({ email });
    if (userExists) return res.status(400).json({ error: "User already exists" });

    const student = await Student.create({ name, email, registrationNo, password, role });

    res.status(201).json({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
      token: generateToken(student._id, student.role),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Login
exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (student && (await student.matchPassword(password))) {
      res.json({
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        token: generateToken(student._id, student.role),
      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");
    if (!student) return res.status(404).json({ error: "User not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
