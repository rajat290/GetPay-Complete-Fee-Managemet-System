const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
require("../models/Role");

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Student.findById(decoded.id)
        .select("-password")
        .populate("institutionId", "name code type isActive subscription enabledModules")
        .populate("roleIds", "name permissions isActive");
      
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      if (user.role === "super_admin") {
        req.user = user;
        req.institutionId = null;
        return next();
      }

      if (!user.institutionId || user.institutionId.isActive === false) {
        return res.status(403).json({ error: "Institution is inactive or missing" });
      }

      const isPasswordChangeRoute = req.originalUrl?.includes("/api/auth/change-password");
      if (user.mustChangePassword && !isPasswordChangeRoute) {
        return res.status(403).json({
          error: "Password change required",
          code: "PASSWORD_CHANGE_REQUIRED"
        });
      }
      
      req.user = user;
      req.institutionId = user.institutionId._id || user.institutionId;
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ error: "Not authorized, no token" });
  }
};

exports.requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  };
};

exports.requireAdmin = exports.requireRole("admin");
exports.requireAdminOrStaff = exports.requireRole("admin", "staff");
exports.requireStudent = exports.requireRole("student");
exports.requireSuperAdmin = exports.requireRole("super_admin");
