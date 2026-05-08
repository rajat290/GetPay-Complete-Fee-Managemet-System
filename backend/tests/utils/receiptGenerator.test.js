const generateReceipt = require("../../utils/receiptGenerator");

describe("receipt generator template", () => {
  it("builds a branded institution receipt template", () => {
    const template = generateReceipt.buildReceiptTemplate({
      institution: {
        name: "Demo College",
        code: "DEMO",
        type: "college",
        email: "office@demo.edu",
        phone: "+91 9876543210",
        address: "Main Road, Jaipur",
        branding: {
          logoUrl: "https://example.com/logo.png",
          primaryColor: "#0f766e",
          receiptFooter: "Fees once paid are subject to institutional policy."
        },
        billingContact: {
          email: "finance@demo.edu"
        }
      },
      student: {
        name: "Student User",
        registrationNo: "STU001",
        email: "student@example.com"
      },
      fee: {
        title: "Tuition Fee"
      },
      payment: {
        _id: "507f191e810c19729de860ea",
        amount: 25000,
        currency: "INR",
        mode: "online",
        status: "completed",
        razorpayPaymentId: "pay_123",
        razorpayOrderId: "order_123",
        verifiedAt: new Date("2026-05-09T10:00:00.000Z")
      }
    });

    expect(template).toMatchObject({
      institutionName: "Demo College",
      institutionCode: "DEMO",
      institutionEmail: "office@demo.edu",
      institutionPhone: "+91 9876543210",
      institutionAddress: "Main Road, Jaipur",
      logoUrl: "https://example.com/logo.png",
      primaryColor: "#0f766e",
      footer: "Fees once paid are subject to institutional policy.",
      feeTitle: "Tuition Fee",
      studentName: "Student User",
      registrationNo: "STU001",
      amount: 25000,
      paymentId: "pay_123",
      orderId: "order_123"
    });
  });

  it("falls back to safe defaults when branding is incomplete", () => {
    const template = generateReceipt.buildReceiptTemplate({
      institution: {
        name: "Default School",
        branding: {
          primaryColor: "not-a-color"
        }
      },
      student: {},
      fee: null,
      payment: {
        _id: "507f191e810c19729de860ea",
        amount: 1000
      }
    });

    expect(template.primaryColor).toBe("#2563eb");
    expect(template.footer).toBe("Thank you for your payment.");
    expect(template.feeTitle).toBe("Fee Payment");
    expect(template.paymentId).toBe("PMTE860EA");
  });
});
