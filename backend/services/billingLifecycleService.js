const Invoice = require("../models/Invoice");
const Institution = require("../models/Institution");

const DEFAULT_GRACE_DAYS = 7;

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const createInvoiceNumber = (institution) => {
  const suffix = String(Date.now()).slice(-8);
  return `INV-${institution.code}-${suffix}`;
};

const createManualInvoice = async ({
  institution,
  amountInr,
  billingPeriodStart,
  billingPeriodEnd,
  dueDate,
  notes = ""
}) => {
  const invoice = await Invoice.create({
    institutionId: institution._id,
    invoiceNumber: createInvoiceNumber(institution),
    amountInr,
    status: "issued",
    billingPeriodStart,
    billingPeriodEnd,
    dueDate,
    notes
  });

  institution.subscription = institution.subscription || {};
  institution.subscription.currentPeriodEndsAt = new Date(billingPeriodEnd);
  if (!institution.subscription.status || institution.subscription.status === "trialing") {
    institution.subscription.status = "active";
  }
  await institution.save();

  return invoice;
};

const markInvoicePaid = async ({ invoice, paidAt = new Date() }) => {
  invoice.status = "paid";
  invoice.paidAt = paidAt;
  await invoice.save();

  const institution = await Institution.findById(invoice.institutionId);
  if (institution) {
    institution.subscription = institution.subscription || {};
    institution.subscription.status = "active";
    institution.subscription.currentPeriodEndsAt = invoice.billingPeriodEnd;
    institution.subscription.gracePeriodEndsAt = undefined;
    institution.isActive = true;
    await institution.save();
  }

  return invoice;
};

const refreshBillingLifecycle = async ({ now = new Date(), graceDays = DEFAULT_GRACE_DAYS } = {}) => {
  const institutions = await Institution.find({
    "subscription.currentPeriodEndsAt": { $lt: now },
    "subscription.status": { $in: ["trialing", "active", "past_due"] }
  });

  const results = [];

  for (const institution of institutions) {
    institution.subscription = institution.subscription || {};

    if (!institution.subscription.gracePeriodEndsAt) {
      institution.subscription.status = "past_due";
      institution.subscription.gracePeriodEndsAt = addDays(institution.subscription.currentPeriodEndsAt, graceDays);
    }

    if (institution.subscription.gracePeriodEndsAt < now) {
      institution.subscription.status = "paused";
      institution.isActive = false;
    }

    await institution.save();
    results.push({
      institutionId: institution._id,
      status: institution.subscription.status,
      isActive: institution.isActive,
      gracePeriodEndsAt: institution.subscription.gracePeriodEndsAt
    });
  }

  await Invoice.updateMany(
    { dueDate: { $lt: now }, status: "issued" },
    { $set: { status: "past_due" } }
  );

  return results;
};

module.exports = {
  DEFAULT_GRACE_DAYS,
  createManualInvoice,
  markInvoicePaid,
  refreshBillingLifecycle
};
