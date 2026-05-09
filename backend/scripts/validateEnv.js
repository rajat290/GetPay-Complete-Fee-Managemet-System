require("dotenv").config();

const { validateEnvironment } = require("../config/environment");

const result = validateEnvironment({ exitOnError: false });

if (result.warnings.length > 0) {
  console.warn("Environment warnings:");
  result.warnings.forEach((warning) => console.warn(`- ${warning}`));
}

if (!result.ok) {
  console.error("Environment validation failed:");
  result.errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Environment validation passed for ${result.environment}.`);
