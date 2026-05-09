const FeeAssignment = require("../models/FeeAssignment");
const logger = require("../utils/logger");

/**
 * Service to synchronize fee assignment statuses.
 * Primarily handles marking pending fees as 'overdue' if the due date has passed.
 */
const syncOverdueStatuses = async (institutionId = null) => {
  const query = {
    status: "pending",
    dueDate: { $lt: new Date() }
  };

  if (institutionId) {
    query.institutionId = institutionId;
  }

  try {
    const result = await FeeAssignment.updateMany(query, {
      $set: { status: "overdue" }
    });

    logger.info("overdue_sync_completed", { modifiedCount: result.modifiedCount });
    return result.modifiedCount;
  } catch (err) {
    logger.error("overdue_sync_failed", { error: err });
    throw err;
  }
};

/**
 * Initializes a simple periodic sync. 
 * In a production app, this would be a Cron job (node-cron).
 * For this implementation, we'll run it every 12 hours.
 */
const startOverdueSyncJob = () => {
  logger.info("overdue_sync_job_started", { intervalHours: 12 });
  
  // Run once on startup
  syncOverdueStatuses().catch((error) => logger.error("overdue_sync_startup_failed", { error }));

  // Then every 12 hours
  setInterval(() => {
    syncOverdueStatuses().catch((error) => logger.error("overdue_sync_interval_failed", { error }));
  }, 12 * 60 * 60 * 1000);
};

module.exports = {
  syncOverdueStatuses,
  startOverdueSyncJob
};
