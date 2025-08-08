const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Models
const Student = require("./models/Student");
const Fee = require("./models/Fee");
const FeeAssignment = require("./models/FeeAssignment");
const Payment = require("./models/Payment");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected for seeding");

    // Clear old data
    await Student.deleteMany();
    await Fee.deleteMany();
    await FeeAssignment.deleteMany();
    await Payment.deleteMany();

    // Admin user (plain password, schema will hash)
    await Student.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123", // plain password
      registrationNo: "ADM1001",
      role: "admin",
      className: "Administration",
    });

    // Classes list
    const classes = ["12thA", "12thB", "11thA", "11thB", "10thA", "10thB"];
    const allStudents = [];
    const allFees = [];
    const allFeeAssignments = [];

    // Create fees first
    const feeTypes = [
      { title: "Tuition Fee", category: "Tuition", amount: 25000 },
      { title: "Hostel Fee", category: "Hostel", amount: 15000 },
      { title: "Library Fee", category: "Other", amount: 2000 },
      { title: "Laboratory Fee", category: "Other", amount: 3000 },
      { title: "Transport Fee", category: "Transport", amount: 8000 }
    ];

    for (const feeType of feeTypes) {
      const fee = await Fee.create({
        ...feeType,
        dueDate: new Date("2024-12-31")
      });
      allFees.push(fee);
    }

    for (let c = 0; c < classes.length; c++) {
      for (let i = 1; i <= 10; i++) {
        const regNo = `STU${c + 1}${i.toString().padStart(3, "0")}`;
        const student = await Student.create({
          name: `${classes[c]} Student ${i}`,
          email: `student${c + 1}_${i}@example.com`,
          password: "123456", // plain password
          registrationNo: regNo,
          role: "student",
          className: classes[c],
        });

        allStudents.push(student);

        // Create fee assignments for each student
        for (const fee of allFees) {
          const feeAssignment = await FeeAssignment.create({
            studentId: student._id,
            feeId: fee._id,
            dueDate: new Date("2024-12-31"),
            status: "pending"
          });
          allFeeAssignments.push(feeAssignment);
        }
      }
    }

    // Create sample payments
    const samplePayments = [
      {
        studentId: allStudents[0]._id,
        assignmentId: allFeeAssignments[0]._id,
        amount: 25000,
        mode: "online",
        status: "completed",
        razorpayPaymentId: "pay_1234567890abcdef",
        razorpayOrderId: "order_1234567890abcdef",
        razorpaySignature: "signature_1234567890abcdef"
      },
      {
        studentId: allStudents[1]._id,
        assignmentId: allFeeAssignments[5]._id,
        amount: 15000,
        mode: "online",
        status: "completed",
        razorpayPaymentId: "pay_abcdef1234567890",
        razorpayOrderId: "order_abcdef1234567890",
        razorpaySignature: "signature_abcdef1234567890"
      },
      {
        studentId: allStudents[2]._id,
        assignmentId: allFeeAssignments[10]._id,
        amount: 2000,
        mode: "online",
        status: "pending",
        razorpayPaymentId: "pay_pending1234567890",
        razorpayOrderId: "order_pending1234567890",
        razorpaySignature: "signature_pending1234567890"
      },
      {
        studentId: allStudents[3]._id,
        assignmentId: allFeeAssignments[15]._id,
        amount: 3000,
        mode: "online",
        status: "failed",
        razorpayPaymentId: "pay_failed1234567890",
        razorpayOrderId: "order_failed1234567890",
        razorpaySignature: "signature_failed1234567890"
      },
      {
        studentId: allStudents[4]._id,
        assignmentId: allFeeAssignments[20]._id,
        amount: 8000,
        mode: "online",
        status: "completed",
        razorpayPaymentId: "pay_transport1234567890",
        razorpayOrderId: "order_transport1234567890",
        razorpaySignature: "signature_transport1234567890"
      }
    ];

    for (const paymentData of samplePayments) {
      await Payment.create(paymentData);
      
      // Update fee assignment status if payment is completed
      if (paymentData.status === 'completed') {
        await FeeAssignment.findByIdAndUpdate(paymentData.assignmentId, { status: 'paid' });
      }
    }

    console.log(`🌱 Seeded ${allStudents.length} students with ${allFees.length} fee types and ${samplePayments.length} sample payments.`);
    mongoose.connection.close();
  })
  .catch((err) => console.error("❌ Seeding error:", err));
