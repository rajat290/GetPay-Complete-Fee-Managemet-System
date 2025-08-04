const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Student = require("./models/Student");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected for seeding...");

    // Purana admin delete kar do (optional)
    await Student.deleteOne({ email: "admin@example.com" });

    // Admin create karo
    const admin = new Student({
      name: "Admin User",
      email: "admin@example.com",
      registrationNo: "ADM1001",
      password: "admin123",  // will be auto-hashed
      role: "admin",
    });

    await admin.save();

    console.log("🌱 Admin user created successfully!");
    mongoose.connection.close();
  })
  .catch((err) => console.error("❌ Seed Error:", err));
