// Run with: mongosh getpay checkData.js

// Total Students & Fees Count
print("📊 Data Summary -------------------");
print("Total Students: " + db.students.countDocuments());
print("Total Fees: " + db.fees.countDocuments());

// Students grouped by Class
print("\n📚 Students by Class:");
db.students.aggregate([
  { $group: { _id: "$className", total: { $sum: 1 } } }
]).forEach(doc => {
  print(doc._id + ": " + doc.total);
});

// Pending Fees Summary
print("\n💰 Pending Fees Summary:");
db.fees.aggregate([
  { $match: { status: "pending" } },
  { $group: { _id: "$category", totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } }
]).forEach(doc => {
  print(doc._id + " -> Count: " + doc.count + ", Total: ₹" + doc.totalAmount);
});

// Show one student with fees
print("\n👤 Example Student with Fees:");
const student = db.students.findOne();
printjson(student);
db.fees.find({ student: student._id }).forEach(fee => printjson(fee));
