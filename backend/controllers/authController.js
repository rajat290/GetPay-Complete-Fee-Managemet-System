const student = require('../models/Student');
const jwt = require('jsonwebtoken');

// genenrate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
}

// Register a new student
exports.registerStudent = async (req, res) => {
    try {
        const { name, email, password, registratioNo, role } = req.body;
        if (!name || !email || !password || !registratioNo || !role) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }
        const userExists = await student.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const student = await student.create({
            name,
            email,
            password,
            registrationNo,
            role,
        });
        const token = generateToken(student._id, student.role);
        res.status(201).json({ token });
    } catch (error) {
        console.error('Error registering student:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Login 
exports.loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }
        const student = await student.findOne({ email });
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

// Get profile

exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");
    if (!student) return res.status(404).json({ error: "User not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};