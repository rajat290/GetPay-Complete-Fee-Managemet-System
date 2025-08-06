const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

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

    // Passwords
    const studentPassword = await bcrypt.hash("123456", 10);
    const adminPassword = await bcrypt.hash("admin123", 10);

    // Admin user
    await Student.create({
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      registrationNo: "ADM1001",
      role: "admin",
      className: "Administration", // ✅ required field
    });

    // Classes list
    const classes = ["Class 10", "Class 11", "Class 12"];
    const allStudents = [];

    for (let c = 0; c < classes.length; c++) {
      for (let i = 1; i <= 20; i++) {
        const regNo = `STU${c + 1}${i.toString().padStart(3, "0")}`;
        const student = new Student({
          name: `${classes[c]} Student ${i}`,
          email: `student${c + 1}_${i}@example.com`,
          password: studentPassword,
          registrationNo: regNo,
          role: "student",
          className: classes[c], // ✅ Add className
        });

        await student.save();
        allStudents.push(student);

        // Fees for each student
        await Fee.insertMany([
          {
            title: "Tuition Fee - Term 1",
            category: "Tuition",
            student: student._id,
            amount: 20000,
            dueDate: new Date("2025-08-30"),
            status: "pending",
          },
          {
            title: "Hostel Fee - Term 1",
            category: "Hostel",
            student: student._id,
            amount: 5000,
            dueDate: new Date("2025-09-15"),
            status: "pending",
          },
          {
            title: "Transport Fee - Term 1",
            category: "Transport",
            student: student._id,
            amount: 8000,
            dueDate: new Date("2025-09-20"),
            status: "pending",
          },
        ]);
      }
    }

    console.log(`🌱 Seeded ${allStudents.length} students with demo fees.`);
    mongoose.connection.close();
  })
  .catch((err) => console.error("❌ Seeding error:", err));
