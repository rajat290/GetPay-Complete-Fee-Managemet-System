const Institution = require("../models/Institution");
const Student = require("../models/Student");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const Branch = require("../models/Branch");
const Receipt = require("../models/Receipt");
const ReminderCampaign = require("../models/ReminderCampaign");
const AdminRecoveryLog = require("../models/AdminRecoveryLog");
const Lead = require("../models/Lead");
const WebsiteContent = require("../models/WebsiteContent");
const LegalPage = require("../models/LegalPage");
const PlatformAnnouncement = require("../models/PlatformAnnouncement");
const { logPlatformAction } = require("../services/auditLogService");
const { buildSubscriptionSummary } = require("../services/subscriptionPlanService");
const { MODULE_CATALOG, DEFAULT_MODULE_KEYS, normalizeModules, getEnabledModules } = require("../services/moduleAccessService");
const { createManualInvoice, markInvoicePaid, refreshBillingLifecycle } = require("../services/billingLifecycleService");

const institutionTypes = ["school", "college", "coaching", "other"];
const subscriptionPlans = ["starter", "growth", "enterprise"];
const subscriptionStatuses = ["trialing", "active", "past_due", "paused", "cancelled"];
const leadStatuses = ["new", "contacted", "demo_scheduled", "trial_active", "converted", "lost"];

const generateTemporaryPassword = () => {
  const random = Math.random().toString(36).slice(2, 8);
  return `GetPay@${random}${Math.floor(10 + Math.random() * 90)}`;
};

const getInstitutionUsageBreakdown = async (institutionId) => {
  const [
    staffCount,
    paymentSummary,
    receiptCount,
    branchCount,
    activeBranchCount,
    reminderCampaignCount
  ] = await Promise.all([
    Student.countDocuments({ institutionId, role: "staff" }),
    Payment.aggregate([
      { $match: { institutionId, status: "completed" } },
      {
        $group: {
          _id: "$mode",
          amount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]),
    Receipt.countDocuments({ institutionId }),
    Branch.countDocuments({ institutionId }),
    Branch.countDocuments({ institutionId, isActive: true }),
    ReminderCampaign.countDocuments({ institutionId })
  ]);

  const payments = paymentSummary.reduce((acc, row) => {
    acc.totalAmount += row.amount;
    acc.totalCount += row.count;
    acc.byMode[row._id] = {
      amount: row.amount,
      count: row.count
    };
    return acc;
  }, { totalAmount: 0, totalCount: 0, byMode: {} });

  const storageEstimateMb = Math.round(((receiptCount * 180) / 1024) * 10) / 10;

  return {
    staff: staffCount,
    payments,
    receipts: receiptCount,
    reminders: reminderCampaignCount,
    branches: {
      total: branchCount,
      active: activeBranchCount
    },
    storage: {
      estimatedMb: storageEstimateMb,
      basis: "receipt_pdf_estimate"
    }
  };
};

const serializeInstitution = async (institution) => {
  const [summary, adminCount, usageBreakdown] = await Promise.all([
    buildSubscriptionSummary(institution),
    Student.countDocuments({
      institutionId: institution._id,
      role: "admin"
    }),
    getInstitutionUsageBreakdown(institution._id)
  ]);

  return {
    ...institution.toObject(),
    adminCount,
    usageBreakdown,
    enabledModules: getEnabledModules(institution),
    subscriptionSummary: summary
  };
};

exports.getPlatformOverview = async (req, res) => {
  try {
    const [
      institutionCount,
      activeInstitutionCount,
      suspendedInstitutionCount,
      trialInstitutionCount,
      pastDueInstitutionCount,
      studentCount,
      adminCount,
      leadCount,
      newLeadCount,
      activeTrialLeadCount,
      openInvoiceTotals
    ] = await Promise.all([
      Institution.countDocuments(),
      Institution.countDocuments({ isActive: true }),
      Institution.countDocuments({ isActive: false }),
      Institution.countDocuments({ "subscription.status": "trialing" }),
      Institution.countDocuments({ "subscription.status": "past_due" }),
      Student.countDocuments({ role: "student" }),
      Student.countDocuments({ role: "admin" }),
      Lead.countDocuments(),
      Lead.countDocuments({ status: "new" }),
      Lead.countDocuments({ status: "trial_active" }),
      Invoice.aggregate([
        { $match: { status: { $in: ["issued", "overdue", "paid"] } } },
        {
          $group: {
            _id: "$status",
            amountInr: { $sum: "$amountInr" },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const billing = openInvoiceTotals.reduce((acc, row) => {
      acc[row._id] = {
        amountInr: row.amountInr,
        count: row.count
      };
      return acc;
    }, {});

    res.json({
      institutions: {
        total: institutionCount,
        active: activeInstitutionCount,
        suspended: suspendedInstitutionCount,
        trialing: trialInstitutionCount,
        pastDue: pastDueInstitutionCount
      },
      users: {
        students: studentCount,
        organizationAdmins: adminCount
      },
      leads: {
        total: leadCount,
        new: newLeadCount,
        trialActive: activeTrialLeadCount
      },
      billing: {
        issued: billing.issued || { amountInr: 0, count: 0 },
        overdue: billing.overdue || { amountInr: 0, count: 0 },
        paid: billing.paid || { amountInr: 0, count: 0 }
      }
    });
  } catch (err) {
    console.error("Error fetching platform overview:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.listLeads = async (req, res) => {
  try {
    const { status, source } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;

    const leads = await Lead.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(leads);
  } catch (err) {
    console.error("Error listing leads:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    if (req.body.status && !leadStatuses.includes(req.body.status)) {
      return res.status(400).json({ error: "Invalid lead status" });
    }

    ["status", "notes", "followUpOwner"].forEach((field) => {
      if (req.body[field] !== undefined) {
        lead[field] = req.body[field];
      }
    });

    if (req.body.nextFollowUpAt !== undefined) {
      lead.nextFollowUpAt = req.body.nextFollowUpAt ? new Date(req.body.nextFollowUpAt) : undefined;
    }

    if (req.body.status === "converted" && !lead.convertedAt) {
      lead.convertedAt = new Date();
    }

    await lead.save();

    await logPlatformAction({
      req,
      action: "platform.lead_updated",
      entityType: "Lead",
      entityId: lead._id,
      summary: `Updated lead ${lead.institutionName}`,
      metadata: {
        leadId: lead._id,
        status: lead.status,
        source: lead.source
      }
    });

    res.json(lead);
  } catch (err) {
    console.error("Error updating lead:", err);
    res.status(500).json({ error: "Server error" });
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
    console.error("Error fetching website content:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateWebsiteContent = async (req, res) => {
  try {
    const allowed = ["announcement", "hero", "contact", "pricingPlans", "faqs"];
    const update = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    });

    const content = await WebsiteContent.findOneAndUpdate(
      { key: "default" },
      { $set: update, $setOnInsert: { key: "default" } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    await logPlatformAction({
      req,
      action: "platform.website_content_updated",
      entityType: "WebsiteContent",
      entityId: content._id,
      summary: "Updated public website content",
      metadata: { fields: Object.keys(update) }
    });

    res.json(content);
  } catch (err) {
    console.error("Error updating website content:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.listLegalPages = async (req, res) => {
  try {
    const pages = await LegalPage.find().sort({ slug: 1 });
    res.json(pages);
  } catch (err) {
    console.error("Error listing legal pages:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.upsertLegalPage = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!["terms", "privacy", "refund-policy", "support"].includes(slug)) {
      return res.status(400).json({ error: "Invalid legal page" });
    }

    const page = await LegalPage.findOneAndUpdate(
      { slug },
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          status: req.body.status || "published",
          lastReviewedAt: req.body.lastReviewedAt ? new Date(req.body.lastReviewedAt) : new Date()
        }
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    await logPlatformAction({
      req,
      action: "platform.legal_page_updated",
      entityType: "LegalPage",
      entityId: page._id,
      summary: `Updated legal page ${page.slug}`,
      metadata: { slug: page.slug, status: page.status }
    });

    res.json(page);
  } catch (err) {
    console.error("Error updating legal page:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.listAnnouncements = async (req, res) => {
  try {
    const announcements = await PlatformAnnouncement.find().sort({ createdAt: -1 }).limit(100);
    res.json(announcements);
  } catch (err) {
    console.error("Error listing announcements:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = await PlatformAnnouncement.create(req.body);

    await logPlatformAction({
      req,
      action: "platform.announcement_created",
      entityType: "PlatformAnnouncement",
      entityId: announcement._id,
      summary: `Created announcement ${announcement.title}`,
      metadata: {
        audience: announcement.audience,
        channel: announcement.channel,
        status: announcement.status
      }
    });

    res.status(201).json(announcement);
  } catch (err) {
    console.error("Error creating announcement:", err);
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

    if (req.body.billingContact !== undefined) {
      institution.billingContact = {
        ...(institution.billingContact?.toObject?.() || institution.billingContact || {}),
        ...req.body.billingContact
      };
    }

    if (req.body.branding !== undefined) {
      institution.branding = {
        ...(institution.branding?.toObject?.() || institution.branding || {}),
        ...req.body.branding
      };
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

exports.archiveInstitution = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ error: "Archive reason is required" });
    }

    institution.isActive = false;
    institution.lifecycle = {
      ...(institution.lifecycle?.toObject?.() || institution.lifecycle || {}),
      archivedAt: new Date(),
      archivedBy: req.user._id,
      archiveReason: reason
    };
    await institution.save();

    await logPlatformAction({
      req,
      action: "platform.institution_archived",
      entityType: "Institution",
      entityId: institution._id,
      summary: `Archived institution ${institution.name}`,
      metadata: {
        institutionId: institution._id,
        reason
      }
    });

    res.json(await serializeInstitution(institution));
  } catch (err) {
    console.error("Error archiving institution:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.restoreInstitution = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    institution.lifecycle = {
      ...(institution.lifecycle?.toObject?.() || institution.lifecycle || {}),
      archivedAt: undefined,
      archivedBy: undefined,
      archiveReason: undefined
    };
    institution.isActive = true;
    await institution.save();

    await logPlatformAction({
      req,
      action: "platform.institution_restored",
      entityType: "Institution",
      entityId: institution._id,
      summary: `Restored institution ${institution.name}`,
      metadata: { institutionId: institution._id }
    });

    res.json(await serializeInstitution(institution));
  } catch (err) {
    console.error("Error restoring institution:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateInstitutionRiskControls = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const allowed = ["freezeInstitution", "blockPayments", "disableLogins", "restrictExports"];
    const nextControls = {
      ...(institution.riskControls?.toObject?.() || institution.riskControls || {})
    };

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        nextControls[field] = Boolean(req.body[field]);
      }
    });

    nextControls.reason = req.body.reason || nextControls.reason;
    nextControls.updatedAt = new Date();
    nextControls.updatedBy = req.user._id;
    institution.riskControls = nextControls;
    await institution.save();

    await logPlatformAction({
      req,
      action: "platform.risk_controls_updated",
      entityType: "Institution",
      entityId: institution._id,
      summary: `Updated risk controls for ${institution.name}`,
      metadata: {
        institutionId: institution._id,
        riskControls: institution.riskControls
      }
    });

    res.json(await serializeInstitution(institution));
  } catch (err) {
    console.error("Error updating risk controls:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateInstitutionSubscription = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const { plan, status, trialEndsAt, currentPeriodEndsAt, limitOverrides } = req.body;

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
    if (limitOverrides !== undefined) {
      institution.subscription.limitOverrides = {
        ...(institution.subscription.limitOverrides?.toObject?.() || institution.subscription.limitOverrides || {}),
        ...["students", "admins", "reminderCampaigns"].reduce((acc, key) => {
          if (limitOverrides[key] !== undefined && limitOverrides[key] !== "") {
            acc[key] = Number(limitOverrides[key]);
          }
          return acc;
        }, {})
      };
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

exports.extendInstitutionTrial = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const days = Math.max(Number(req.body.days) || 0, 1);
    const base = institution.subscription?.trialEndsAt && institution.subscription.trialEndsAt > new Date()
      ? institution.subscription.trialEndsAt
      : new Date();
    const nextTrialEndsAt = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

    institution.subscription = institution.subscription || {};
    institution.subscription.status = "trialing";
    institution.subscription.trialEndsAt = nextTrialEndsAt;
    institution.isActive = true;
    await institution.save();

    await logPlatformAction({
      req,
      action: "platform.trial_extended",
      entityType: "Institution",
      entityId: institution._id,
      summary: `Extended trial for ${institution.name} by ${days} days`,
      metadata: {
        institutionId: institution._id,
        days,
        trialEndsAt: nextTrialEndsAt
      }
    });

    res.json(await serializeInstitution(institution));
  } catch (err) {
    console.error("Error extending trial:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.convertInstitutionTrial = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const { plan = institution.subscription?.plan || "starter", currentPeriodEndsAt } = req.body;
    if (!subscriptionPlans.includes(plan)) {
      return res.status(400).json({ error: "Invalid subscription plan" });
    }

    institution.subscription = institution.subscription || {};
    institution.subscription.plan = plan;
    institution.subscription.status = "active";
    institution.subscription.trialEndsAt = undefined;
    institution.subscription.currentPeriodEndsAt = currentPeriodEndsAt
      ? new Date(currentPeriodEndsAt)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    institution.isActive = true;
    await institution.save();

    await Lead.updateMany(
      { institutionId: institution._id, status: { $ne: "converted" } },
      { $set: { status: "converted", convertedAt: new Date() } }
    );

    await logPlatformAction({
      req,
      action: "platform.trial_converted",
      entityType: "Institution",
      entityId: institution._id,
      summary: `Converted trial to paid for ${institution.name}`,
      metadata: {
        institutionId: institution._id,
        plan,
        currentPeriodEndsAt: institution.subscription.currentPeriodEndsAt
      }
    });

    res.json(await serializeInstitution(institution));
  } catch (err) {
    console.error("Error converting trial:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.listOrganizationAdmins = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const admins = await Student.find({ institutionId: institution._id, role: "admin" })
      .select("_id name email registrationNo mustChangePassword status createdAt updatedAt")
      .sort({ createdAt: -1 });

    res.json(admins);
  } catch (err) {
    console.error("Error listing organization admins:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.recoverOrganizationAdmin = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const admin = await Student.findOne({
      _id: req.params.adminId,
      institutionId: institution._id,
      role: "admin"
    });
    if (!admin) {
      return res.status(404).json({ error: "Organization admin not found" });
    }

    const { action = "force_password_change", reason } = req.body;
    if (!["force_password_change", "temporary_password_reset"].includes(action)) {
      return res.status(400).json({ error: "Invalid recovery action" });
    }
    if (!reason) {
      return res.status(400).json({ error: "Recovery reason is required" });
    }

    let temporaryPassword;
    admin.mustChangePassword = true;
    if (action === "temporary_password_reset") {
      temporaryPassword = generateTemporaryPassword();
      admin.password = temporaryPassword;
    }
    await admin.save();

    const recoveryLog = await AdminRecoveryLog.create({
      institutionId: institution._id,
      adminId: admin._id,
      action,
      reason,
      performedBy: req.user._id,
      temporaryPasswordIssued: Boolean(temporaryPassword)
    });

    await logPlatformAction({
      req,
      action: "platform.admin_recovery",
      entityType: "Student",
      entityId: admin._id,
      summary: `Performed admin recovery for ${admin.email}`,
      metadata: {
        institutionId: institution._id,
        adminId: admin._id,
        recoveryAction: action,
        recoveryLogId: recoveryLog._id
      }
    });

    res.json({
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        mustChangePassword: admin.mustChangePassword
      },
      recoveryLog,
      temporaryPassword
    });
  } catch (err) {
    console.error("Error recovering organization admin:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.listAdminRecoveryLogs = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const logs = await AdminRecoveryLog.find({ institutionId: institution._id })
      .populate("adminId", "name email")
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (err) {
    console.error("Error listing admin recovery logs:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.listInstitutionInvoices = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const invoices = await Invoice.find({ institutionId: institution._id }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    console.error("Error listing invoices:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createInstitutionInvoice = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.institutionId);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const { amountInr, billingPeriodStart, billingPeriodEnd, dueDate, notes } = req.body;
    if (!amountInr || !billingPeriodStart || !billingPeriodEnd || !dueDate) {
      return res.status(400).json({ error: "Amount, billing period, and due date are required" });
    }

    const invoice = await createManualInvoice({
      institution,
      amountInr: Number(amountInr),
      billingPeriodStart: new Date(billingPeriodStart),
      billingPeriodEnd: new Date(billingPeriodEnd),
      dueDate: new Date(dueDate),
      notes
    });

    await logPlatformAction({
      req,
      action: "platform.invoice_created",
      entityType: "Invoice",
      entityId: invoice._id,
      summary: `Created invoice ${invoice.invoiceNumber} for ${institution.name}`,
      metadata: {
        institutionId: institution._id,
        invoiceNumber: invoice.invoiceNumber,
        amountInr: invoice.amountInr,
        dueDate: invoice.dueDate
      }
    });

    res.status(201).json(invoice);
  } catch (err) {
    console.error("Error creating invoice:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.markInstitutionInvoicePaid = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.invoiceId,
      institutionId: req.params.institutionId
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    await markInvoicePaid({ invoice, paidAt: req.body.paidAt ? new Date(req.body.paidAt) : new Date() });

    await logPlatformAction({
      req,
      action: "platform.invoice_paid",
      entityType: "Invoice",
      entityId: invoice._id,
      summary: `Marked invoice ${invoice.invoiceNumber} as paid`,
      metadata: {
        institutionId: invoice.institutionId,
        invoiceNumber: invoice.invoiceNumber,
        paidAt: invoice.paidAt
      }
    });

    res.json(invoice);
  } catch (err) {
    console.error("Error marking invoice paid:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.runBillingLifecycleRefresh = async (req, res) => {
  try {
    const results = await refreshBillingLifecycle();

    await logPlatformAction({
      req,
      action: "platform.billing_lifecycle_refreshed",
      entityType: "BillingLifecycle",
      summary: `Refreshed billing lifecycle for ${results.length} institutions`,
      metadata: { results }
    });

    res.json({ updated: results.length, results });
  } catch (err) {
    console.error("Error refreshing billing lifecycle:", err);
    res.status(500).json({ error: "Server error" });
  }
};
