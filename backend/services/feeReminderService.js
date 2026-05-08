const Notification = require("../models/Notification");
const ReminderCampaign = require("../models/ReminderCampaign");
const emailService = require("../utils/emailService");
const { buildDuesReport } = require("./duesReportService");

const formatCurrency = (amount) => `INR ${Number(amount || 0).toLocaleString("en-IN")}`;

const buildReminderMessage = (row) => {
  const feeTitle = row.fee?.title || "assigned fee";
  const dueDate = row.dueDate ? new Date(row.dueDate).toLocaleDateString("en-IN") : "the due date";

  return `Your ${feeTitle} balance of ${formatCurrency(row.dueAmount)} is ${row.status}. Please complete the payment by ${dueDate} or contact the institution accounts office.`;
};

const sendDueReminders = async ({
  institutionId,
  filters = {},
  channel = "notification",
  dryRun = false
}) => {
  const report = await buildDuesReport({ institutionId, filters });
  const rows = report.rows || [];
  const shouldNotify = channel === "notification" || channel === "both";
  const shouldEmail = channel === "email" || channel === "both";

  const summary = {
    matchedCount: rows.length,
    notificationCount: 0,
    emailAttemptCount: 0,
    skippedCount: 0,
    dryRun
  };

  const recipients = [];

  for (const row of rows) {
    if (!row.student?._id || !row.fee?._id) {
      summary.skippedCount += 1;
      continue;
    }

    const message = buildReminderMessage(row);
    recipients.push({
      studentId: row.student._id,
      studentName: row.student.name,
      studentEmail: row.student.email,
      assignmentId: row.assignmentId,
      feeTitle: row.fee.title,
      dueAmount: row.dueAmount,
      status: row.status,
      dueDate: row.dueDate
    });

    if (dryRun) continue;

    if (shouldNotify) {
      await Notification.create({
        institutionId,
        studentId: row.student._id,
        title: row.status === "overdue" ? "Overdue fee reminder" : "Fee payment reminder",
        message,
        type: row.status === "overdue" ? "warning" : "info",
        relatedFee: row.assignmentId
      });
      summary.notificationCount += 1;
    }

    if (shouldEmail && row.student.email) {
      await emailService.sendFeeReminder({
        student: row.student,
        fee: {
          title: row.fee.title,
          amount: row.dueAmount,
          dueDate: row.dueDate,
          message
        }
      });
      summary.emailAttemptCount += 1;
    }
  }

  return {
    generatedAt: new Date(),
    filters,
    channel,
    summary,
    recipients
  };
};

const buildCampaignFilters = (campaign) => {
  const filters = {
    status: campaign.filters?.status || "overdue"
  };

  if (campaign.filters?.className) {
    filters.className = campaign.filters.className;
  }

  if (Number(campaign.filters?.dueBeforeDays) > 0) {
    const dueBefore = new Date();
    dueBefore.setDate(dueBefore.getDate() + Number(campaign.filters.dueBeforeDays));
    filters.dueBefore = dueBefore.toISOString().slice(0, 10);
  }

  return filters;
};

const runReminderCampaign = async ({ institutionId, campaignId, dryRun = false }) => {
  const campaign = await ReminderCampaign.findOne({
    _id: campaignId,
    institutionId
  });

  if (!campaign) {
    const error = new Error("Reminder campaign not found");
    error.statusCode = 404;
    throw error;
  }

  if (!campaign.isActive && !dryRun) {
    const error = new Error("Reminder campaign is inactive");
    error.statusCode = 409;
    throw error;
  }

  const result = await sendDueReminders({
    institutionId,
    filters: buildCampaignFilters(campaign),
    channel: campaign.channel,
    dryRun
  });

  if (!dryRun) {
    campaign.lastRunAt = new Date();
    campaign.runCount += 1;
    await campaign.save();
  }

  return {
    campaign,
    result
  };
};

module.exports = {
  sendDueReminders,
  runReminderCampaign
};
