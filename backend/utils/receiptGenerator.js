const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Institution = require("../models/Institution");
const FeeAssignment = require("../models/FeeAssignment");

const getReceiptPath = (paymentId) => path.join(__dirname, "../receipts", `receipt_${paymentId}.pdf`);

const normalizeColor = (color) => (/^#[0-9a-f]{6}$/i.test(color || "") ? color : "#2563eb");

const buildReceiptTemplate = ({ student, payment, fee, institution }) => {
  const branding = institution?.branding || {};
  const billingContact = institution?.billingContact || {};

  return {
    institutionName: institution?.name || "GetPay Education",
    institutionCode: institution?.code || "",
    institutionType: institution?.type || "",
    institutionEmail: institution?.email || billingContact.email || "",
    institutionPhone: institution?.phone || billingContact.phone || "",
    institutionAddress: institution?.address || "",
    primaryColor: normalizeColor(branding.primaryColor),
    logoUrl: branding.logoUrl || "",
    footer: branding.receiptFooter || "Thank you for your payment.",
    feeTitle: fee?.title || "Fee Payment",
    studentName: student?.name || "N/A",
    registrationNo: student?.registrationNo || "N/A",
    studentEmail: student?.email || "N/A",
    amount: payment?.amount || 0,
    currency: payment?.currency || "INR",
    paymentId: payment?.razorpayPaymentId || payment?.referenceNo || `PMT${payment?._id?.toString().slice(-6).toUpperCase()}`,
    orderId: payment?.razorpayOrderId || "N/A",
    mode: payment?.mode || "online",
    status: payment?.status || "completed",
    paidAt: payment?.verifiedAt || payment?.updatedAt || payment?.createdAt || new Date()
  };
};

const loadReceiptContext = async ({ student, assignmentId, payment, institution }) => {
  const [resolvedInstitution, assignment] = await Promise.all([
    institution || Institution.findById(payment.institutionId),
    FeeAssignment.findOne({
      _id: assignmentId || payment.assignmentId,
      institutionId: payment.institutionId,
      studentId: student._id
    }).populate("feeId", "title")
  ]);

  return {
    institution: resolvedInstitution,
    fee: assignment?.feeId || null
  };
};

const generateReceipt = async (student, assignmentId, payment, institution) => {
  const receiptsDir = path.join(__dirname, "../receipts");
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }

  const { institution: resolvedInstitution, fee } = await loadReceiptContext({
    student,
    assignmentId,
    payment,
    institution
  });

  const template = buildReceiptTemplate({
    student,
    payment,
    fee,
    institution: resolvedInstitution
  });

  const doc = new PDFDocument({ margin: 48, size: "A4" });
  const filePath = getReceiptPath(payment._id);

  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.rect(0, 0, doc.page.width, 96).fill(template.primaryColor);
    doc.fillColor("#ffffff").fontSize(22).text(template.institutionName, 48, 30, { width: 360 });
    doc.fontSize(10).text("Payment Receipt", 48, 58, { width: 360 });

    if (template.logoUrl) {
      doc.fontSize(8).text("Logo URL", 450, 28, { width: 90, align: "right" });
      doc.fontSize(7).text(template.logoUrl, 390, 42, { width: 150, align: "right" });
    }

    doc.fillColor("#111827").fontSize(10);
    doc.text(template.institutionAddress || "", 48, 118, { width: 260 });
    doc.text([template.institutionEmail, template.institutionPhone].filter(Boolean).join(" | "), 48, 134, { width: 360 });

    doc.roundedRect(48, 168, 499, 98, 6).strokeColor("#e5e7eb").stroke();
    doc.fontSize(9).fillColor("#6b7280").text("Student", 68, 188);
    doc.fontSize(13).fillColor("#111827").text(template.studentName, 68, 204, { width: 220 });
    doc.fontSize(9).fillColor("#6b7280").text(`Registration: ${template.registrationNo}`, 68, 226);
    doc.text(`Email: ${template.studentEmail}`, 68, 242, { width: 220 });

    doc.fontSize(9).fillColor("#6b7280").text("Receipt", 340, 188);
    doc.fontSize(13).fillColor("#111827").text(template.paymentId, 340, 204, { width: 170 });
    doc.fontSize(9).fillColor("#6b7280").text(`Date: ${new Date(template.paidAt).toDateString()}`, 340, 226);
    doc.text(`Status: ${template.status.toUpperCase()}`, 340, 242);

    doc.moveTo(48, 306).lineTo(547, 306).strokeColor("#e5e7eb").stroke();
    doc.fontSize(10).fillColor("#6b7280").text("Fee", 68, 330);
    doc.fillColor("#111827").text(template.feeTitle, 68, 350, { width: 220 });
    doc.fillColor("#6b7280").text("Mode", 300, 330);
    doc.fillColor("#111827").text(template.mode.replace(/_/g, " ").toUpperCase(), 300, 350);
    doc.fillColor("#6b7280").text("Amount Paid", 420, 330, { width: 90, align: "right" });
    doc.fontSize(16).fillColor(template.primaryColor).text(`${template.currency} ${template.amount}`, 398, 348, {
      width: 112,
      align: "right"
    });

    doc.fontSize(9).fillColor("#6b7280").text(`Order ID: ${template.orderId}`, 68, 396, { width: 420 });
    doc.moveTo(48, 688).lineTo(547, 688).strokeColor("#e5e7eb").stroke();
    doc.fontSize(9).fillColor("#374151").text(template.footer, 48, 706, {
      width: 499,
      align: "center"
    });

    doc.end();

    stream.on("finish", () => {
      resolve(filePath);
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });
};

generateReceipt.getReceiptPath = getReceiptPath;
generateReceipt.buildReceiptTemplate = buildReceiptTemplate;

module.exports = generateReceipt;
