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
    }
  },
  growth: {
    key: "growth",
    name: "Growth",
    monthlyPriceInr: 14999,
    limits: {
      students: 2500,
      admins: 10,
      reminderCampaigns: 25
    }
  },
  enterprise: {
    key: "enterprise",
    name: "Enterprise",
    monthlyPriceInr: null,
    limits: {
      students: null,
      admins: null,
      reminderCampaigns: null
    }
  }
};

const getPlan = (planKey = "starter") => PLAN_CATALOG[planKey] || PLAN_CATALOG.starter;

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
    }
  };
};

module.exports = {
  PLAN_CATALOG,
  getPlan,
  getInstitutionUsage,
  buildSubscriptionSummary
};
