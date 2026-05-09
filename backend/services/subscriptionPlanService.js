const Student = require("../models/Student");
const ReminderCampaign = require("../models/ReminderCampaign");

const PLAN_CATALOG = {
  starter: {
    key: "starter",
    name: "Starter",
    monthlyPriceInr: 4999,
    limits: {
      students: 500,
      admins: 2,
      reminderCampaigns: 3
    },
    features: [
      "Student fee collection",
      "Manual and online payments",
      "Branded receipts",
      "Basic dues reminders"
    ]
  },
  growth: {
    key: "growth",
    name: "Growth",
    monthlyPriceInr: 14999,
    limits: {
      students: 2500,
      admins: 10,
      reminderCampaigns: 25
    },
    features: [
      "Everything in Starter",
      "Bulk fee assignment",
      "Audit trail",
      "Saved reminder campaigns",
      "Finance reconciliation workspace"
    ]
  },
  enterprise: {
    key: "enterprise",
    name: "Enterprise",
    monthlyPriceInr: null,
    limits: {
      students: null,
      admins: null,
      reminderCampaigns: null
    },
    features: [
      "Everything in Growth",
      "Unlimited students",
      "Dedicated onboarding",
      "Custom reporting and integrations",
      "Priority support"
    ]
  }
};

const getPlan = (planKey = "starter") => PLAN_CATALOG[planKey] || PLAN_CATALOG.starter;

const isLimitReached = (used, limit) => Number.isFinite(limit) && used >= limit;

const getInstitutionUsage = async (institutionId) => {
  const [studentCount, adminCount, reminderCampaignCount] = await Promise.all([
    Student.countDocuments({ institutionId, role: "student" }),
    Student.countDocuments({ institutionId, role: "admin" }),
    ReminderCampaign.countDocuments({ institutionId })
  ]);

  return {
    students: studentCount,
    admins: adminCount,
    reminderCampaigns: reminderCampaignCount
  };
};

const buildSubscriptionSummary = async (institution) => {
  const plan = getPlan(institution?.subscription?.plan);
  const usage = await getInstitutionUsage(institution._id);

  return {
    subscription: {
      plan: plan.key,
      planName: plan.name,
      status: institution.subscription?.status || "trialing",
      trialEndsAt: institution.subscription?.trialEndsAt || null,
      currentPeriodEndsAt: institution.subscription?.currentPeriodEndsAt || null
    },
    pricing: {
      monthlyPriceInr: plan.monthlyPriceInr
    },
    limits: plan.limits,
    usage,
    utilization: {
      students: plan.limits.students ? Math.round((usage.students / plan.limits.students) * 100) : null,
      admins: plan.limits.admins ? Math.round((usage.admins / plan.limits.admins) * 100) : null,
      reminderCampaigns: plan.limits.reminderCampaigns
        ? Math.round((usage.reminderCampaigns / plan.limits.reminderCampaigns) * 100)
        : null
    },
    features: plan.features
  };
};

const assertCanAddStudent = async (institution) => {
  const plan = getPlan(institution?.subscription?.plan);
  const usage = await getInstitutionUsage(institution._id);

  if (isLimitReached(usage.students, plan.limits.students)) {
    const error = new Error(`Student limit reached for ${plan.name} plan`);
    error.statusCode = 402;
    error.code = "PLAN_STUDENT_LIMIT_REACHED";
    error.details = {
      plan: plan.key,
      limit: plan.limits.students,
      used: usage.students
    };
    throw error;
  }

  return {
    plan,
    usage
  };
};

const assertCanAddReminderCampaign = async (institution) => {
  const plan = getPlan(institution?.subscription?.plan);
  const usage = await getInstitutionUsage(institution._id);

  if (isLimitReached(usage.reminderCampaigns, plan.limits.reminderCampaigns)) {
    const error = new Error(`Reminder campaign limit reached for ${plan.name} plan`);
    error.statusCode = 402;
    error.code = "PLAN_REMINDER_CAMPAIGN_LIMIT_REACHED";
    error.details = {
      plan: plan.key,
      limit: plan.limits.reminderCampaigns,
      used: usage.reminderCampaigns
    };
    throw error;
  }

  return {
    plan,
    usage
  };
};

module.exports = {
  PLAN_CATALOG,
  getPlan,
  getInstitutionUsage,
  buildSubscriptionSummary,
  assertCanAddStudent,
  assertCanAddReminderCampaign
};
