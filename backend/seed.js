const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Models
const Student = require("./models/Student");
const Fee = require("./models/Fee");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected for seeding");

    // Clear old data
    await Student.deleteMany();
    await Fee.deleteMany();

    // Insert demo student (plain password)
    const student = await Student.create({
      name: "Test Student",
      email: "student@test.com",
      password: "123456", // plain password, model will hash
      registrationNo: "STU1001",
      role: "student",
    });

    // Insert demo admin (plain password)
    await Student.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123", // plain password, model will hash
      registrationNo: "ADM1001",
      role: "admin",
    });

    // Insert demo fees
    await Fee.insertMany([
      {
        title: "Tuition Fee - Semester 1",
        category: "Tuition",
        student: student._id,
        amount: 20000,
        dueDate: new Date("2025-08-30"),
        status: "pending",
      },
      {
        title: "Hostel Fee - Semester 1",
        category: "Hostel",
        student: student._id,
        amount: 5000,
        dueDate: new Date("2025-08-20"),
        status: "pending",
      },
      {
        title: "Transport Fee - Semester 1",
        category: "Transport",
        student: student._id,
        amount: 10000,
        dueDate: new Date("2025-09-10"),
        status: "pending",
      },
    ]);

    console.log("🌱 Demo students, admin, and fees seeded successfully!");
    mongoose.connection.close();
  })
  .catch((err) => console.error("❌ Seeding error:", err));
