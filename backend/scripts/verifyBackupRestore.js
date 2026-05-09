const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const dotenv = require("dotenv");

dotenv.config();

const sourceUri = process.env.BACKUP_SOURCE_URI || process.env.MONGODB_URI || process.env.MONGO_URI;
const restoreUri = process.env.BACKUP_RESTORE_URI;

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}`);
  }
};

const assertMongoTools = () => {
  for (const command of ["mongodump", "mongorestore"]) {
    const result = spawnSync(command, ["--version"], { stdio: "ignore", shell: process.platform === "win32" });
    if (result.status !== 0) {
      throw new Error(`${command} is required. Install MongoDB Database Tools before running backup verification.`);
    }
  }
};

const main = () => {
  if (!sourceUri) {
    throw new Error("Set BACKUP_SOURCE_URI or MONGODB_URI before running backup verification.");
  }

  if (!restoreUri) {
    throw new Error("Set BACKUP_RESTORE_URI to a disposable MongoDB database. Never point it at production.");
  }

  if (sourceUri === restoreUri) {
    throw new Error("BACKUP_RESTORE_URI must be different from the source database.");
  }

  assertMongoTools();

  const backupDir = fs.mkdtempSync(path.join(os.tmpdir(), "getpay-backup-verify-"));
  console.log(`Creating verification backup in ${backupDir}`);

  run("mongodump", ["--uri", sourceUri, "--out", backupDir]);
  run("mongorestore", ["--uri", restoreUri, "--drop", backupDir]);

  console.log("Backup/restore verification completed successfully.");
};

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
