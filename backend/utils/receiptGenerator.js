const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateReceipt = async (student, assignmentId, payment) => {
  // Ensure receipts directory exists
  const receiptsDir = path.join(__dirname, "../receipts");
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }

  const doc = new PDFDocument();
  const filePath = path.join(receiptsDir, `receipt_${payment._id}.pdf`);
  
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text("GetPay - Payment Receipt", { align: "center" });
    doc.moveDown();

    // Student Info
    doc.fontSize(14).text(`Student Name: ${student.name || 'N/A'}`);
    doc.text(`Registration No: ${student.registrationNo || 'N/A'}`);
    doc.text(`Email: ${student.email || 'N/A'}`);
    doc.moveDown();

    // Payment Info
    doc.text(`Amount Paid: ₹${payment.amount || 0}`);
    doc.text(`Payment ID: ${payment.razorpayPaymentId || 'N/A'}`);
    doc.text(`Order ID: ${payment.razorpayOrderId || 'N/A'}`);
    doc.text(`Date: ${new Date().toDateString()}`);
    doc.text(`Status: ${payment.status || 'completed'}`);
    doc.moveDown();

    // Footer
    doc.fontSize(10).text("Thank you for your payment!", { align: "center" });
    
    doc.end();

    stream.on('finish', () => {
      resolve(filePath);
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
};

module.exports = generateReceipt;