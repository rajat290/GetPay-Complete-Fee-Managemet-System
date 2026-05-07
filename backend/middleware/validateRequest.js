const mongoose = require("mongoose");

const getValue = (source, key) => source?.[key];

const validateRequest = (schema = {}) => {
  return (req, res, next) => {
    const errors = [];

    for (const location of ["body", "params", "query"]) {
      const rules = schema[location] || {};
      const source = req[location] || {};

      for (const [field, rule] of Object.entries(rules)) {
        const value = getValue(source, field);
        const isMissing = value === undefined || value === null || value === "";

        if (rule.required && isMissing) {
          errors.push({ field, location, message: `${field} is required` });
          continue;
        }

        if (isMissing) continue;

        if (rule.type === "number" && Number.isNaN(Number(value))) {
          errors.push({ field, location, message: `${field} must be a number` });
        }

        if (rule.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
          errors.push({ field, location, message: `${field} must be a valid email` });
        }

        if (rule.type === "objectId" && !mongoose.Types.ObjectId.isValid(String(value))) {
          errors.push({ field, location, message: `${field} must be a valid id` });
        }

        if (rule.enum && !rule.enum.includes(value)) {
          errors.push({ field, location, message: `${field} must be one of: ${rule.enum.join(", ")}` });
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors
      });
    }

    next();
  };
};

module.exports = validateRequest;
