const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Institution = require("./models/Institution");
const Branch = require("./models/Branch");
const AcademicSession = require("./models/AcademicSession");
const ClassGroup = require("./models/ClassGroup");
const Student = require("./models/Student");
const Fee = require("./models/Fee");
const FeeAssignment = require("./models/FeeAssignment");

dotenv.config();

const DEMO = {
  institutionCode: "GETPAY-DEMO",
  adminEmail: "admin@example.com",
  adminPassword: "admin123",
  studentEmail: "student@example.com",
  studentPassword: "123456"
};

const upsertDemo = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to seed demo data");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const institution = await Institution.findOneAndUpdate(
    { code: DEMO.institutionCode },
    {
      $set: {
        name: "GetPay Demo College",
        code: DEMO.institutionCode,
        type: "college",
        email: DEMO.adminEmail,
        phone: "9999999999",
        address: "Demo Campus",
        isActive: true
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const branch = await Branch.findOneAndUpdate(
    { institutionId: institution._id, code: "MAIN" },
    {
      $set: {
        institutionId: institution._id,
        name: "Main Campus",
        code: "MAIN",
        address: "Demo Campus",
        phone: "9999999999"
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const academicSession = await AcademicSession.findOneAndUpdate(
    { institutionId: institution._id, name: "2026-27" },
    {
      $set: {
        institutionId: institution._id,
        name: "2026-27",
        startsAt: new Date("2026-04-01"),
        endsAt: new Date("2027-03-31"),
        isCurrent: true
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const classGroup = await ClassGroup.findOneAndUpdate(
    { institutionId: institution._id, code: "12thA" },
    {
      $set: {
        institutionId: institution._id,
        branchId: branch._id,
        academicSessionId: academicSession._id,
        name: "12thA",
        code: "12thA"
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const admin = await ensureUser({
    institution,
    branch,
    academicSession,
    classGroup,
    name: "Admin User",
    email: DEMO.adminEmail,
    password: DEMO.adminPassword,
    registrationNo: "ADM1001",
    role: "admin",
    className: "Administration"
  });

  const student = await ensureUser({
    institution,
    branch,
    academicSession,
    classGroup,
    name: "Demo Student",
    email: DEMO.studentEmail,
    password: DEMO.studentPassword,
    registrationNo: "STU1001",
    role: "student",
    className: "12thA"
  });

  const fee = await Fee.findOneAndUpdate(
    { institutionId: institution._id, title: "Tuition Fee" },
    {
      $set: {
        institutionId: institution._id,
        academicSessionId: academicSession._id,
        title: "Tuition Fee",
        amount: 25000,
        category: "Tuition",
        dueDate: new Date("2026-12-31")
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await FeeAssignment.findOneAndUpdate(
    { institutionId: institution._id, studentId: student._id, feeId: fee._id },
    {
      $setOnInsert: {
        institutionId: institution._id,
        academicSessionId: academicSession._id,
        studentId: student._id,
        feeId: fee._id,
        dueDate: new Date("2026-12-31"),
        status: "pending"
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  console.log("Demo data is ready:");
  console.log(`Institution: ${DEMO.institutionCode}`);
  console.log(`Admin: ${admin.email} / ${DEMO.adminPassword}`);
  console.log(`Student: ${student.email} / ${DEMO.studentPassword}`);
};

const ensureUser = async ({
  institution,
  branch,
  academicSession,
  classGroup,
  name,
  email,
  password,
  registrationNo,
  role,
  className
}) => {
  let user = await Student.findOne({
    $or: [
      { institutionId: institution._id, email },
      { registrationNo },
      { email }
    ]
  });

  if (!user) {
    user = await Student.create({
      institutionId: institution._id,
      branchId: branch._id,
      academicSessionId: academicSession._id,
      classGroupId: role === "student" ? classGroup._id : undefined,
      name,
      email,
      password,
      registrationNo,
      role,
      className
    });
    return user;
  }

  user.set({
    institutionId: institution._id,
    branchId: branch._id,
    academicSessionId: academicSession._id,
    classGroupId: role === "student" ? classGroup._id : user.classGroupId,
    name,
    registrationNo,
    role,
    className,
    status: "active"
  });

  if (!(await user.matchPassword(password))) {
    user.password = password;
  }

  await user.save();
  return user;
};

upsertDemo()
  .catch((error) => {
    console.error("Demo seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
