const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const logger = require("../utils/logger");
require("../models/Role");

const getCookieToken = (req) => {
  const cookieHeader = req.headers.cookie || "";
  const match = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith("getpay_token="));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
};

exports.protect = async (req, res, next) => {
  let token;

  if ((req.headers.authorization && req.headers.authorization.startsWith("Bearer")) || getCookieToken(req)) {
    try {
      token = req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : getCookieToken(req);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Student.findById(decoded.id)
        .select("-password")
        .populate("institutionId", "name code type isActive subscription enabledModules lifecycle riskControls")
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

      if (user.institutionId.lifecycle?.archivedAt) {
        return res.status(403).json({ error: "Institution is archived" });
      }

      if (user.institutionId.riskControls?.disableLogins || user.institutionId.riskControls?.freezeInstitution) {
        return res.status(403).json({ error: "Institution access is temporarily restricted" });
      }

      const isPasswordChangeRoute = req.originalUrl?.includes("/api/auth/change-password");
      if (user.mustChangePassword && !isPasswordChangeRoute) {
        return res.status(403).json({
          error: "Password change required",
          code: "PASSWORD_CHANGE_REQUIRED"
        });
      }
      
      req.user = user;
      req.impersonation = decoded.impersonation || null;
      req.institutionId = user.institutionId._id || user.institutionId;
      next();
    } catch (error) {
      logger.error("token_verification_failed", { error });
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
