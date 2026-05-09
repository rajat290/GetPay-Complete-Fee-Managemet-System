const mongoose = require("mongoose");

const getValue = (source, key) => source?.[key];

const cleanString = (value) => (typeof value === "string" ? value.trim() : value);

const sanitizeByRules = (source, rules) => {
  const sanitized = {};
  for (const field of Object.keys(rules)) {
    if (source[field] !== undefined) {
      const rule = rules[field];
      const value = source[field];
      if (rule.type === "boolean" && typeof value === "string") {
        sanitized[field] = value === "true";
      } else if (rule.type === "number") {
        sanitized[field] = Number(value);
      } else {
        sanitized[field] = cleanString(value);
      }
    }
  }
  return sanitized;
};

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

        const normalizedValue = cleanString(value);

        if (rule.type === "number") {
          const numberValue = Number(normalizedValue);
          if (Number.isNaN(numberValue)) {
            errors.push({ field, location, message: `${field} must be a number` });
          }
          if (rule.min !== undefined && numberValue < rule.min) {
            errors.push({ field, location, message: `${field} must be at least ${rule.min}` });
          }
          if (rule.max !== undefined && numberValue > rule.max) {
            errors.push({ field, location, message: `${field} must be at most ${rule.max}` });
          }
        }

        if (rule.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(normalizedValue))) {
          errors.push({ field, location, message: `${field} must be a valid email` });
        }

        if (rule.type === "objectId" && !mongoose.Types.ObjectId.isValid(String(normalizedValue))) {
          errors.push({ field, location, message: `${field} must be a valid id` });
        }

        if (rule.type === "date" && Number.isNaN(new Date(normalizedValue).getTime())) {
          errors.push({ field, location, message: `${field} must be a valid date` });
        }

        if (rule.type === "object" && (Array.isArray(value) || typeof value !== "object")) {
          errors.push({ field, location, message: `${field} must be an object` });
        }

        if (rule.type === "array" && !Array.isArray(value)) {
          errors.push({ field, location, message: `${field} must be an array` });
        }

        if (rule.type === "boolean" && !["true", "false", true, false].includes(value)) {
          errors.push({ field, location, message: `${field} must be a boolean` });
        }

        if (rule.minLength !== undefined && String(normalizedValue).length < rule.minLength) {
          errors.push({ field, location, message: `${field} must be at least ${rule.minLength} characters` });
        }

        if (rule.maxLength !== undefined && String(normalizedValue).length > rule.maxLength) {
          errors.push({ field, location, message: `${field} must be at most ${rule.maxLength} characters` });
        }

        if (rule.enum && !rule.enum.includes(normalizedValue)) {
          errors.push({ field, location, message: `${field} must be one of: ${rule.enum.join(", ")}` });
        }

        if (rule.arrayOfEnum) {
          if (!Array.isArray(value)) {
            errors.push({ field, location, message: `${field} must be an array` });
          } else {
            const invalid = value.filter((item) => !rule.arrayOfEnum.includes(item));
            if (invalid.length > 0) {
              errors.push({ field, location, message: `${field} contains unsupported values: ${invalid.join(", ")}` });
            }
          }
        }
      }

      if (schema.stripUnknown !== false && location === "body" && Object.keys(rules).length > 0) {
        req[location] = sanitizeByRules(source, rules);
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
