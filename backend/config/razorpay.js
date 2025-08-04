const Razorpay = require('razorpay');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Error: Razorpay keys are missing in .env");
}

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpayInstance;
// This code initializes a Razorpay instance using the credentials stored in environment variables.
// It exports the instance for use in other parts of the application, such as payment processing or other Razorpay-related operations.