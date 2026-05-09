const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Student = require("./models/Student");

const createSuperAdmin = async () => {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME || "Platform Owner";

  if (!email || !password) {
    throw new Error("SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required");
  }

  await connectDB();

  const existing = await Student.findOne({ email: email.toLowerCase(), role: "super_admin" });
  if (existing) {
    console.log(`Super admin already exists: ${email}`);
    return existing;
  }

  const superAdmin = await Student.create({
    name,
    email,
    password,
    role: "super_admin"
  });

  console.log(`Super admin created: ${superAdmin.email}`);

  return superAdmin;
};

createSuperAdmin()
  .then(() => mongoose.connection.close())
  .catch((error) => {
    console.error("Super admin seed failed:", error);
    mongoose.connection.close().finally(() => process.exit(1));
  });
