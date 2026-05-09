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
  // 1. Find institutions whose period has ended and aren't paused/cancelled yet
  const institutions = await Institution.find({
    "subscription.currentPeriodEndsAt": { $lt: now },
    "subscription.status": { $in: ["trialing", "active", "past_due"] }
  });

  const results = [];

  for (const institution of institutions) {
    institution.subscription = institution.subscription || {};

    // If it just ended, mark as past_due and start grace period
    if (institution.subscription.status !== "past_due") {
      institution.subscription.status = "past_due";
      institution.subscription.gracePeriodEndsAt = addDays(now, graceDays);
      console.log(`[BillingSync] Institution ${institution.code} moved to past_due. Grace until ${institution.subscription.gracePeriodEndsAt}`);
    } 
    // If grace period is over, pause the institution
    else if (institution.subscription.gracePeriodEndsAt && institution.subscription.gracePeriodEndsAt < now) {
      institution.subscription.status = "paused";
      institution.isActive = false;
      console.log(`[BillingSync] Institution ${institution.code} grace period expired. Paused access.`);
    }

    await institution.save();
    results.push({
      institutionId: institution._id,
      code: institution.code,
      status: institution.subscription.status,
      isActive: institution.isActive
    });
  }

  // 2. Mark any 'issued' invoices as 'past_due' if their due date passed
  const invoiceResult = await Invoice.updateMany(
    { dueDate: { $lt: now }, status: "issued" },
    { $set: { status: "past_due" } }
  );

  if (invoiceResult.modifiedCount > 0) {
    console.log(`[BillingSync] Marked ${invoiceResult.modifiedCount} invoices as past_due.`);
  }

  return results;
};

/**
 * Initializes a periodic billing sync.
 * Runs every 6 hours to check for expirations.
 */
const startBillingSyncJob = () => {
  console.log("[BillingSync] Starting periodic lifecycle sync job (6h interval).");
  
  // Run once on startup
  refreshBillingLifecycle().catch(err => console.error("[BillingSync] Startup error:", err));

  // Then every 6 hours
  setInterval(() => {
    refreshBillingLifecycle().catch(err => console.error("[BillingSync] Periodic error:", err));
  }, 6 * 60 * 60 * 1000);
};

module.exports = {
  DEFAULT_GRACE_DAYS,
  createManualInvoice,
  markInvoicePaid,
  refreshBillingLifecycle,
  startBillingSyncJob
};
