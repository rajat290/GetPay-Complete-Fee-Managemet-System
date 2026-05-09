const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const backupDir = process.env.BACKUP_DIR || path.join(process.cwd(), "backups");
const isDryRun = process.argv.includes("--dry-run");

if (!mongoUri) {
  console.error("MONGODB_URI is required to run a MongoDB backup.");
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const archivePath = path.join(backupDir, `getpay-${timestamp}.archive.gz`);
const args = [`--uri=${mongoUri}`, `--archive=${archivePath}`, "--gzip"];

if (isDryRun) {
  console.log(JSON.stringify({
    command: "mongodump",
    args: args.map((arg) => arg.startsWith("--uri=") ? "--uri=[REDACTED]" : arg),
    archivePath
  }, null, 2));
  process.exit(0);
}

fs.mkdirSync(backupDir, { recursive: true });

const child = spawn("mongodump", args, {
  stdio: "inherit",
  shell: process.platform === "win32"
});

child.on("exit", (code) => {
  if (code === 0) {
    console.log(`MongoDB backup written to ${archivePath}`);
  }
  process.exit(code || 0);
});
