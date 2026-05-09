const Institution = require("../models/Institution");
const Student = require("../models/Student");
const Lead = require("../models/Lead");
const WebsiteContent = require("../models/WebsiteContent");
const LegalPage = require("../models/LegalPage");
const { DEFAULT_MODULE_KEYS } = require("../services/moduleAccessService");

const institutionTypes = ["school", "college", "coaching", "other"];
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateInstitutionCode = (name) => {
  const base = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "ORG";
  return `${base}${Math.floor(1000 + Math.random() * 9000)}`;
};

const clean = (value) => (typeof value === "string" ? value.trim() : value);

const defaultLegalPages = {
  terms: {
    title: "Terms of Service",
    content: "These terms govern institutional use of GetPay Education. A full legal review should be completed before production launch."
  },
  privacy: {
    title: "Privacy Policy",
    content: "GetPay Education collects account, institution, student, payment, and operational data only to provide the service. A full privacy review should be completed before production launch."
  },
  "refund-policy": {
    title: "Refund Policy",
    content: "Institution subscription refunds and payment gateway refunds are reviewed according to the signed commercial agreement and applicable gateway rules."
  },
  support: {
    title: "Support",
    content: "For sales, onboarding, or product support, contact the GetPay team through the public contact form."
  }
};

const createLead = async ({
  source,
  institutionId,
  institutionName,
  institutionType,
  contactName,
  contactEmail,
  contactPhone,
  planInterest,
  subject,
  message,
  status,
  metadata = {}
}) => Lead.create({
  source,
  institutionId,
  institutionName: clean(institutionName),
  institutionType: institutionType || "school",
  contactName: clean(contactName),
  contactEmail: clean(contactEmail)?.toLowerCase(),
  contactPhone: clean(contactPhone),
  planInterest: planInterest || "not_sure",
  subject: clean(subject),
  message: clean(message),
  status: status || "new",
  metadata
});

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

    await createLead({
      source: "trial_signup",
      status: "trial_active",
      institutionId: institution._id,
      institutionName: institution.name,
      institutionType: institution.type,
      contactName: admin.name,
      contactEmail: admin.email,
      contactPhone: institution.phone,
      planInterest: "starter",
      subject: "Self-service trial signup",
      message: "Institution started a 14-day free trial from the public website.",
      metadata: {
        institutionCode: institution.code,
        trialEndsAt: institution.subscription.trialEndsAt
      }
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

exports.captureLead = async (req, res) => {
  try {
    const {
      source = "contact",
      institutionName,
      institutionType = "school",
      contactName,
      contactEmail,
      contactPhone,
      planInterest = "not_sure",
      subject,
      message
    } = req.body;

    if (!["request_demo", "contact", "support"].includes(source)) {
      return res.status(400).json({ error: "Invalid lead source" });
    }

    if (!institutionName || !contactName || !contactEmail || !message) {
      return res.status(400).json({ error: "Institution, contact name, email, and message are required" });
    }

    if (!institutionTypes.includes(institutionType)) {
      return res.status(400).json({ error: "Invalid institution type" });
    }

    if (!emailRegex.test(contactEmail)) {
      return res.status(400).json({ error: "A valid contact email is required" });
    }

    const lead = await createLead({
      source,
      institutionName,
      institutionType,
      contactName,
      contactEmail,
      contactPhone,
      planInterest,
      subject: subject || (source === "request_demo" ? "Demo request" : "Website query"),
      message,
      metadata: {
        userAgent: req.get("user-agent"),
        ip: req.ip
      }
    });

    res.status(201).json({
      success: true,
      message: source === "request_demo" ? "Demo request received" : "Query received",
      leadId: lead._id
    });
  } catch (err) {
    console.error("Public Lead Capture Error:", err);
    res.status(500).json({ error: "Server error while capturing query" });
  }
};

exports.getWebsiteContent = async (req, res) => {
  try {
    const content = await WebsiteContent.findOneAndUpdate(
      { key: "default" },
      { $setOnInsert: { key: "default" } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(content);
  } catch (err) {
    console.error("Public Website Content Error:", err);
    res.status(500).json({ error: "Server error while loading website content" });
  }
};

exports.getLegalPage = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!defaultLegalPages[slug]) {
      return res.status(404).json({ error: "Legal page not found" });
    }

    const page = await LegalPage.findOneAndUpdate(
      { slug },
      { $setOnInsert: { slug, ...defaultLegalPages[slug] } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (page.status !== "published") {
      return res.status(404).json({ error: "Legal page not found" });
    }

    res.json(page);
  } catch (err) {
    console.error("Public Legal Page Error:", err);
    res.status(500).json({ error: "Server error while loading legal page" });
  }
};
