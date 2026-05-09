const Institution = require("../models/Institution");
const Student = require("../models/Student");
const { logPlatformAction } = require("../services/auditLogService");
const { buildSubscriptionSummary } = require("../services/subscriptionPlanService");
const { MODULE_CATALOG, DEFAULT_MODULE_KEYS, normalizeModules, getEnabledModules } = require("../services/moduleAccessService");

const institutionTypes = ["school", "college", "coaching", "other"];
const subscriptionPlans = ["starter", "growth", "enterprise"];
const subscriptionStatuses = ["trialing", "active", "past_due", "paused", "cancelled"];

const serializeInstitution = async (institution) => {
  const summary = await buildSubscriptionSummary(institution);
  const adminCount = await Student.countDocuments({
    institutionId: institution._id,
    role: "admin"
  });

  return {
    ...institution.toObject(),
    adminCount,
    enabledModules: getEnabledModules(institution),
    subscriptionSummary: summary
  };
};

exports.getPlatformOverview = async (req, res) => {
  try {
    const [institutionCount, activeInstitutionCount, suspendedInstitutionCount, studentCount, adminCount] = await Promise.all([
      Institution.countDocuments(),
      Institution.countDocuments({ isActive: true }),
      Institution.countDocuments({ isActive: false }),
      Student.countDocuments({ role: "student" }),
      Student.countDocuments({ role: "admin" })
    ]);

    res.json({
      institutions: {
        total: institutionCount,
        active: activeInstitutionCount,
        suspended: suspendedInstitutionCount
      },
      users: {
        students: studentCount,
        organizationAdmins: adminCount
      }
    });
  } catch (err) {
    console.error("Error fetching platform overview:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getModuleCatalog = async (req, res) => {
  res.json({
    modules: MODULE_CATALOG,
    defaultModules: DEFAULT_MODULE_KEYS
  });
};

exports.listInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.find().sort({ createdAt: -1 });
    const rows = await Promise.all(institutions.map(serializeInstitution));
    res.json(rows);
  } catch (err) {
    console.error("Error listing institutions:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getInstitution = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    res.json(await serializeInstitution(institution));
  } catch (err) {
    console.error("Error fetching institution:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createInstitution = async (req, res) => {
  try {
    const {
      name,
      code,
      type = "school",
      email,
      phone,
      address,
      plan = "starter",
      subscriptionStatus = "trialing",
      adminName,
      adminEmail,
      adminPassword,
      adminRegistrationNo = "ORG-ADMIN-001"
    } = req.body;

    if (!institutionTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid institution type" });
    }

    if (!subscriptionPlans.includes(plan) || !subscriptionStatuses.includes(subscriptionStatus)) {
      return res.status(400).json({ error: "Invalid subscription plan or status" });
    }

    const institution = await Institution.create({
      name,
      code,
      type,
      email,
      phone,
      address,
      subscription: {
        plan,
        status: subscriptionStatus
      },
      enabledModules: DEFAULT_MODULE_KEYS
    });

    const admin = await Student.create({
      institutionId: institution._id,
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      registrationNo: adminRegistrationNo,
      className: "Administration",
      role: "admin"
    });

    await logPlatformAction({
      req,
      action: "platform.institution_created",
      entityType: "Institution",
      entityId: institution._id,
      summary: `Created institution ${institution.name}`,
      metadata: {
        institutionId: institution._id,
        code: institution.code,
        plan,
        adminId: admin._id,
        adminEmail: admin.email
      }
    });

    res.status(201).json({
      institution: await serializeInstitution(institution),
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error("Error creating institution:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Institution or admin already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateInstitutionModules = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    institution.enabledModules = normalizeModules(req.body.enabledModules);
    await institution.save();

    await logPlatformAction({
      req,
      action: "platform.modules_updated",
      entityType: "Institution",
      entityId: institution._id,
      summary: `Updated module access for ${institution.name}`,
      metadata: {
        institutionId: institution._id,
        enabledModules: institution.enabledModules
      }
    });

    res.json(await serializeInstitution(institution));
  } catch (err) {
    console.error("Error updating institution modules:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateInstitution = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    ["name", "type", "email", "phone", "address"].forEach((field) => {
      if (req.body[field] !== undefined) {
        institution[field] = req.body[field];
      }
    });

    if (req.body.isActive !== undefined) {
      institution.isActive = Boolean(req.body.isActive);
    }

    await institution.save();

    await logPlatformAction({
      req,
      action: "platform.institution_updated",
      entityType: "Institution",
      entityId: institution._id,
      summary: `Updated institution ${institution.name}`,
      metadata: {
        institutionId: institution._id,
        isActive: institution.isActive
      }
    });

    res.json(await serializeInstitution(institution));
  } catch (err) {
    console.error("Error updating institution:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateInstitutionSubscription = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const { plan, status, trialEndsAt, currentPeriodEndsAt } = req.body;

    if (plan && !subscriptionPlans.includes(plan)) {
      return res.status(400).json({ error: "Invalid subscription plan" });
    }

    if (status && !subscriptionStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid subscription status" });
    }

    institution.subscription = institution.subscription || {};
    if (plan) institution.subscription.plan = plan;
    if (status) institution.subscription.status = status;
    if (trialEndsAt !== undefined) institution.subscription.trialEndsAt = trialEndsAt ? new Date(trialEndsAt) : undefined;
    if (currentPeriodEndsAt !== undefined) {
      institution.subscription.currentPeriodEndsAt = currentPeriodEndsAt ? new Date(currentPeriodEndsAt) : undefined;
    }

    await institution.save();

    await logPlatformAction({
      req,
      action: "platform.subscription_updated",
      entityType: "Institution",
      entityId: institution._id,
      summary: `Updated subscription for ${institution.name}`,
      metadata: {
        institutionId: institution._id,
        plan: institution.subscription.plan,
        status: institution.subscription.status
      }
    });

    res.json(await serializeInstitution(institution));
  } catch (err) {
    console.error("Error updating institution subscription:", err);
    res.status(500).json({ error: "Server error" });
  }
};
