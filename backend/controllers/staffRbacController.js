const crypto = require("crypto");
const Student = require("../models/Student");
const Role = require("../models/Role");
const { logAdminAction } = require("../services/auditLogService");
const { PERMISSION_CATALOG, normalizePermissions } = require("../services/permissionCatalogService");

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  return obj;
};

const ensureOrgAdmin = (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403).json({ error: "Only organization admins can manage staff and roles" });
    return false;
  }
  return true;
};

exports.getPermissionCatalog = async (req, res) => {
  res.json({ permissions: PERMISSION_CATALOG });
};

exports.listRoles = async (req, res) => {
  const roles = await Role.find({ institutionId: req.institutionId }).sort({ name: 1 });
  res.json(roles);
};

exports.createRole = async (req, res) => {
  try {
    if (!ensureOrgAdmin(req, res)) return;

    const { name, description = "", permissions = [] } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Role name is required" });
    }

    const role = await Role.create({
      institutionId: req.institutionId,
      name: name.trim(),
      description,
      permissions: normalizePermissions(permissions),
      isSystem: false
    });

    await logAdminAction({
      req,
      action: "role.created",
      entityType: "Role",
      entityId: role._id,
      summary: `Created role ${role.name}`,
      metadata: { permissions: role.permissions }
    });

    res.status(201).json(role);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Role name already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateRole = async (req, res) => {
  try {
    if (!ensureOrgAdmin(req, res)) return;

    const role = await Role.findOne({ _id: req.params.roleId, institutionId: req.institutionId });
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    if (req.body.name !== undefined) role.name = String(req.body.name).trim();
    if (req.body.description !== undefined) role.description = req.body.description;
    if (req.body.permissions !== undefined) role.permissions = normalizePermissions(req.body.permissions);
    if (req.body.isActive !== undefined) role.isActive = Boolean(req.body.isActive);

    await role.save();

    await logAdminAction({
      req,
      action: "role.updated",
      entityType: "Role",
      entityId: role._id,
      summary: `Updated role ${role.name}`,
      metadata: { permissions: role.permissions, isActive: role.isActive }
    });

    res.json(role);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Role name already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

exports.listStaff = async (req, res) => {
  const staff = await Student.find({
    institutionId: req.institutionId,
    role: "staff"
  })
    .select("-password")
    .populate("roleIds", "name permissions isActive")
    .sort({ createdAt: -1 });

  res.json(staff);
};

exports.createStaff = async (req, res) => {
  try {
    if (!ensureOrgAdmin(req, res)) return;

    const { name, email, employeeCode, roleIds = [], password } = req.body;
    if (!name || !email || !employeeCode) {
      return res.status(400).json({ error: "Name, email, and employee code are required" });
    }

    const validRoles = await Role.find({
      institutionId: req.institutionId,
      _id: { $in: roleIds },
      isActive: true
    }).select("_id");

    const tempPassword = password || crypto.randomBytes(6).toString("base64url");

    const staff = await Student.create({
      institutionId: req.institutionId,
      name,
      email,
      registrationNo: employeeCode,
      className: "Staff",
      password: tempPassword,
      role: "staff",
      roleIds: validRoles.map((role) => role._id),
      mustChangePassword: true,
      status: "active"
    });

    await logAdminAction({
      req,
      action: "staff.created",
      entityType: "Student",
      entityId: staff._id,
      summary: `Created staff user ${staff.name}`,
      metadata: {
        email: staff.email,
        employeeCode,
        roleIds: staff.roleIds
      }
    });

    res.status(201).json({
      staff: sanitizeUser(staff),
      temporaryPassword: tempPassword
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Staff email or employee code already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    if (!ensureOrgAdmin(req, res)) return;

    const staff = await Student.findOne({
      _id: req.params.staffId,
      institutionId: req.institutionId,
      role: "staff"
    });

    if (!staff) {
      return res.status(404).json({ error: "Staff user not found" });
    }

    if (req.body.name !== undefined) staff.name = req.body.name;
    if (req.body.email !== undefined) staff.email = req.body.email;
    if (req.body.employeeCode !== undefined) staff.registrationNo = req.body.employeeCode;
    if (req.body.status !== undefined) staff.status = req.body.status;

    if (req.body.roleIds !== undefined) {
      const validRoles = await Role.find({
        institutionId: req.institutionId,
        _id: { $in: req.body.roleIds },
        isActive: true
      }).select("_id");
      staff.roleIds = validRoles.map((role) => role._id);
    }

    let temporaryPassword = null;
    if (req.body.resetPassword) {
      temporaryPassword = crypto.randomBytes(6).toString("base64url");
      staff.password = temporaryPassword;
      staff.mustChangePassword = true;
    }

    await staff.save();
    await staff.populate("roleIds", "name permissions isActive");

    await logAdminAction({
      req,
      action: "staff.updated",
      entityType: "Student",
      entityId: staff._id,
      summary: `Updated staff user ${staff.name}`,
      metadata: {
        status: staff.status,
        roleIds: staff.roleIds.map((role) => role._id || role)
      }
    });

    const response = { staff: sanitizeUser(staff) };
    if (temporaryPassword) {
      response.temporaryPassword = temporaryPassword;
    }

    res.json(response);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Staff email or employee code already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};
