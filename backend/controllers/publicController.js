const Institution = require("../models/Institution");
const Student = require("../models/Student");
const { DEFAULT_MODULE_KEYS } = require("../services/moduleAccessService");

const institutionTypes = ["school", "college", "coaching", "other"];
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateInstitutionCode = (name) => {
  const base = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "ORG";
  return `${base}${Math.floor(1000 + Math.random() * 9000)}`;
};

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

    if (!name || !email || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!institutionTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid institution type" });
    }

    if (!emailRegex.test(email) || !emailRegex.test(adminEmail)) {
      return res.status(400).json({ error: "A valid institution and admin email are required" });
    }

    if (adminPassword.length < 8) {
      return res.status(400).json({ error: "Admin password must be at least 8 characters" });
    }

    const existingAdmin = await Student.findOne({ email: adminEmail.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ error: "An account with this admin email already exists" });
    }

    let code = generateInstitutionCode(name);
    for (let attempt = 0; attempt < 5; attempt++) {
      const existingCode = await Institution.exists({ code });
      if (!existingCode) break;
      code = generateInstitutionCode(name);
    }

    const institution = await Institution.create({
      name: name.trim(),
      code,
      type,
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      subscription: {
        plan: "starter",
        status: "trialing",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      },
      enabledModules: DEFAULT_MODULE_KEYS
    });

    const admin = await Student.create({
      institutionId: institution._id,
      name: adminName.trim(),
      email: adminEmail.toLowerCase().trim(),
      password: adminPassword,
      registrationNo: "ADMIN-001",
      className: "Administration",
      role: "admin"
    });

    res.status(201).json({
      success: true,
      message: "Trial registration successful",
      institutionId: institution._id,
      institutionCode: institution.code,
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
