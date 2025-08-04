const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, enum: ["Tuition", "Hostel", "Transport", "Other"], required: true },
  dueDate: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Fee", feeSchema);
// This schema defines the structure for the Fee model, which includes fields for title, amount, category, and due date.
// The category field is an enum that restricts the values to specific types of fees.   