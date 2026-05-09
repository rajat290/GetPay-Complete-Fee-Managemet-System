const { loadInstitutionForModuleCheck, institutionHasModule } = require("../services/moduleAccessService");

const requireModule = (moduleKey) => {
  return async (req, res, next) => {
    try {
      if (req.user?.role === "super_admin") {
        return next();
      }

      if (!req.institutionId) {
        return res.status(403).json({ error: "Institution context is required" });
      }

      const institution = await loadInstitutionForModuleCheck(req.institutionId);
      if (!institution || institution.isActive === false) {
        return res.status(403).json({ error: "Institution is inactive or missing" });
      }

      if (!institutionHasModule(institution, moduleKey)) {
        return res.status(403).json({
          error: "Module access disabled for this institution",
          module: moduleKey
        });
      }

      next();
    } catch (error) {
      console.error("Module access check failed:", error);
      res.status(500).json({ error: "Server error" });
    }
  };
};

module.exports = {
  requireModule
};
