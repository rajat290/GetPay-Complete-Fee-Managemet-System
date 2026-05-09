const getUserPermissions = (user) => {
  if (!user) return [];

  if (user.role === "admin" || user.role === "super_admin") {
    return ["*"];
  }

  const roles = Array.isArray(user.roleIds) ? user.roleIds : [];
  return [
    ...new Set(
      roles
        .filter((role) => role && role.isActive !== false)
        .flatMap((role) => role.permissions || [])
    )
  ];
};

const hasPermission = (user, permission) => {
  const permissions = getUserPermissions(user);
  return permissions.includes("*") || permissions.includes(permission);
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({ error: "Permission denied", permission });
    }

    next();
  };
};

module.exports = {
  getUserPermissions,
  hasPermission,
  requirePermission
};
