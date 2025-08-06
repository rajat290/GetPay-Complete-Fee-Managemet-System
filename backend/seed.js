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

    // Create admin
    const adminPassword = await bcrypt.hash("admin123", 10);
    await Student.create({
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      registrationNo: "ADM1001",
      role: "admin",
      className: "Admin",
    });

    // Classes list
    const classes = ["Class A", "Class B", "Class C"];

    // Create demo students + fees
    for (let classIndex = 0; classIndex < classes.length; classIndex++) {
      const className = classes[classIndex];

      for (let i = 1; i <= 20; i++) {
        const regNo = `${className.replace(" ", "").toUpperCase()}${1000 + i}`;
        const studentPassword = await bcrypt.hash("123456", 10);

        const student = await Student.create({
          name: `${className} Student ${i}`,
          email: `student${classIndex + 1}_${i}@example.com`,
          password: studentPassword,
          registrationNo: regNo,
          role: "student",
          className,
        });

        // Assign 3 types of fees to each student
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
      }
    }

    console.log("🌱 Demo admin, students, and fees seeded successfully!");
    mongoose.connection.close();
  })
  .catch((err) => console.error("❌ Seeding error:", err));
