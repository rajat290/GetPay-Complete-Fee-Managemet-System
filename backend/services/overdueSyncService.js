const FeeAssignment = require("../models/FeeAssignment");

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

    console.log(`[OverdueSync] Marked ${result.modifiedCount} assignments as overdue.`);
    return result.modifiedCount;
  } catch (err) {
    console.error("[OverdueSync] Error during status sync:", err);
    throw err;
  }
};

/**
 * Initializes a simple periodic sync. 
 * In a production app, this would be a Cron job (node-cron).
 * For this implementation, we'll run it every 12 hours.
 */
const startOverdueSyncJob = () => {
  console.log("[OverdueSync] Starting periodic status sync job (12h interval).");
  
  // Run once on startup
  syncOverdueStatuses().catch(console.error);

  // Then every 12 hours
  setInterval(() => {
    syncOverdueStatuses().catch(console.error);
  }, 12 * 60 * 60 * 1000);
};

module.exports = {
  syncOverdueStatuses,
  startOverdueSyncJob
};
