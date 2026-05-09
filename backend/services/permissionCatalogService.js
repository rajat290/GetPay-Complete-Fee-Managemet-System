const PERMISSION_CATALOG = [
  { key: "student.view", label: "View students", group: "Students" },
  { key: "student.create", label: "Create students", group: "Students" },
  { key: "student.update", label: "Update students", group: "Students" },
  { key: "fee.view", label: "View fees", group: "Fees" },
  { key: "fee.create", label: "Create fees", group: "Fees" },
  { key: "fee.assign", label: "Assign fees", group: "Fees" },
  { key: "fee.collect", label: "Collect fees", group: "Fees" },
  { key: "payment.record_offline", label: "Record offline payments", group: "Payments" },
  { key: "receipt.download", label: "Download receipts", group: "Receipts" },
  { key: "analytics.view", label: "View analytics", group: "Analytics" },
  { key: "report.export", label: "Export reports", group: "Reports" },
  { key: "staff.manage", label: "Manage staff and roles", group: "Administration" },
  { key: "settings.manage", label: "Manage institution settings", group: "Administration" }
];

const ALL_PERMISSION_KEYS = PERMISSION_CATALOG.map((permission) => permission.key);

const normalizePermissions = (permissions = []) => {
  const allowed = new Set(ALL_PERMISSION_KEYS);
  return [...new Set(permissions)].filter((permission) => allowed.has(permission));
};

module.exports = {
  PERMISSION_CATALOG,
  ALL_PERMISSION_KEYS,
  normalizePermissions
};
