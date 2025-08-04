const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateReceipt = (student, fee, payment) => {
  const doc = new PDFDocument();

  const filePath = path.join(__dirname, `../receipts/receipt_${payment._id}.pdf`);
  doc.pipe(fs.createWriteStream(filePath));

  // Header
  doc.fontSize(20).text("GetPay - Payment Receipt", { align: "center" });
  doc.moveDown();

  // Student Info
  doc.fontSize(14).text(`Student Name: ${student.name}`);
  doc.text(`Registration No: ${student.registrationNo}`);
  doc.text(`Email: ${student.email}`);
  doc.moveDown();

  // Fee Info
  doc.text(`Fee Title: ${fee.title}`);
  doc.text(`Amount Paid: ₹${payment.amount}`);
  doc.text(`Category: ${fee.category}`);
  doc.text(`Due Date: ${fee.dueDate.toDateString()}`);
  doc.moveDown();

  // Payment Info
  doc.text(`Payment ID: ${payment.razorpayPaymentId}`);
  doc.text(`Order ID: ${payment.razorpayOrderId}`);
  doc.text(`Date: ${new Date().toDateString()}`);
  doc.text(`Status: ${payment.status}`);
  
  doc.end();

  return filePath;
};

module.exports = generateReceipt;
// This function generates a PDF receipt for a payment made by a student. It includes student information, fee details, and payment information. The generated PDF is saved in the receipts directory with a unique filename based on the payment ID. The function returns the file path of the generated receipt.