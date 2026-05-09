const Institution = require("../models/Institution");
const Student = require("../models/Student");
const Invoice = require("../models/Invoice");
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
