const AuditLog = require("../models/AuditLog");

const logAdminAction = async ({
  req,
  action,
  entityType,
  entityId,
  summary,
  metadata = {}
}) => {
  try {
    if (!req?.user || !req?.institutionId) return null;

    return await AuditLog.create({
      institutionId: req.institutionId,
      actorId: req.user._id,
      actorRole: req.user.role,
      action,
      entityType,
      entityId,
      summary,
      metadata,
      ipAddress: req.ip,
      userAgent: req.get?.("user-agent")
    });
  } catch (error) {
    console.error("Audit log write failed:", error);
    return null;
  }
};

const logPlatformAction = async ({
  req,
  action,
  entityType,
  entityId,
  summary,
  metadata = {}
}) => {
  try {
    if (!req?.user || req.user.role !== "super_admin") return null;

    return await AuditLog.create({
      actorId: req.user._id,
      actorRole: req.user.role,
      action,
      entityType,
      entityId,
      summary,
      metadata,
      ipAddress: req.ip,
      userAgent: req.get?.("user-agent")
    });
  } catch (error) {
    console.error("Platform audit log write failed:", error);
    return null;
  }
};

const buildAuditLogQuery = ({ institutionId, filters = {} }) => {
  const query = { institutionId };

  if (filters.action) {
    query.action = filters.action;
  }

  if (filters.entityType) {
    query.entityType = filters.entityType;
  }

  if (filters.actorId) {
    query.actorId = filters.actorId;
  }

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};

    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  return query;
};

const listAuditLogs = async ({ institutionId, filters = {} }) => {
  const limit = Math.min(Math.max(Number(filters.limit) || 50, 1), 100);
  const page = Math.max(Number(filters.page) || 1, 1);
  const query = buildAuditLogQuery({ institutionId, filters });

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate("actorId", "name email registrationNo role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    AuditLog.countDocuments(query)
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    rows: logs.map((log) => ({
      _id: log._id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      summary: log.summary,
      metadata: log.metadata,
      actor: log.actorId ? {
        _id: log.actorId._id,
        name: log.actorId.name,
        email: log.actorId.email,
        registrationNo: log.actorId.registrationNo,
        role: log.actorId.role
      } : null,
      actorRole: log.actorRole,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt
    }))
  };
};

const listPlatformAuditLogs = async (filters = {}) => {
  const limit = Math.min(Math.max(Number(filters.limit) || 50, 1), 100);
  const page = Math.max(Number(filters.page) || 1, 1);
  
  const query = { actorRole: "super_admin" };

  if (filters.action) query.action = filters.action;
  if (filters.entityType) query.entityType = filters.entityType;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate("actorId", "name email role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    AuditLog.countDocuments(query)
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    rows: logs
  };
};

module.exports = {
  logAdminAction,
  logPlatformAction,
  listAuditLogs,
  listPlatformAuditLogs
};
