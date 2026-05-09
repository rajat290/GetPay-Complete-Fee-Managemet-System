const Institution = require("../models/Institution");
const Student = require("../models/Student");
const { DEFAULT_MODULE_KEYS } = require("../services/moduleAccessService");

/**
 * Register a new institution for a free trial
 */
exports.registerTrial = async (req, res) => {
  try {
    const {
      name,
      type = "school",
      email,
      phone,
      adminName,
      adminEmail,
      adminPassword
    } = req.body;

    // Basic validation
    if (!name || !email || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate a unique code from name
    const code = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) + Math.floor(Math.random() * 1000);

    // Create Institution in Trialing state
    const institution = await Institution.create({
      name,
      code,
      type,
      email,
      phone,
      subscription: {
        plan: "starter",
        status: "trialing",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      },
      enabledModules: DEFAULT_MODULE_KEYS
    });

    // Create Initial Admin
    const admin = await Student.create({
      institutionId: institution._id,
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      registrationNo: "ADMIN-001",
      className: "Administration",
      role: "admin"
    });

    res.status(201).json({
      success: true,
      message: "Trial registration successful",
      institutionId: institution._id,
      adminId: admin._id
    });
  } catch (err) {
    console.error("Public Trial Registration Error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Institution code or admin email already exists" });
    }
    res.status(500).json({ error: "Server error during registration" });
  }
};
