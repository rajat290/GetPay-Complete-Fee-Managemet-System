const getRiskControls = (req) => req.user?.institutionId?.riskControls || {};

const requirePaymentsAllowed = (req, res, next) => {
  const riskControls = getRiskControls(req);
  if (riskControls.blockPayments || riskControls.freezeInstitution) {
    return res.status(403).json({ error: "Payments are temporarily blocked for this institution" });
  }
  next();
};

const requireExportsAllowed = (req, res, next) => {
  const riskControls = getRiskControls(req);
  if (riskControls.restrictExports || riskControls.freezeInstitution) {
    return res.status(403).json({ error: "Exports are temporarily restricted for this institution" });
  }
  next();
};

module.exports = {
  requirePaymentsAllowed,
  requireExportsAllowed
};
