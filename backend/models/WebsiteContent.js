const mongoose = require("mongoose");

const pricingPlanSchema = new mongoose.Schema({
  key: {
    type: String,
    enum: ["starter", "growth", "enterprise"],
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  priceInr: {
    type: Number,
    default: 0,
  },
  billingCycle: {
    type: String,
    default: "month",
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  features: [{
    type: String,
    trim: true,
  }],
  isVisible: {
    type: Boolean,
    default: true,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
  trialEnabled: {
    type: Boolean,
    default: true,
  },
}, { _id: false });

const websiteContentSchema = new mongoose.Schema({
  key: {
    type: String,
    unique: true,
    default: "default",
  },
  announcement: {
    enabled: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      trim: true,
      default: "",
    },
    ctaLabel: {
      type: String,
      trim: true,
      default: "Start trial",
    },
    ctaPath: {
      type: String,
      trim: true,
      default: "/trial",
    },
  },
  hero: {
    eyebrow: {
      type: String,
      trim: true,
      default: "The modern standard for education finance",
    },
    title: {
      type: String,
      trim: true,
      default: "GetPay Education",
    },
    subtitle: {
      type: String,
      trim: true,
      default: "Institution-grade fee collection, receipts, reminders, and reporting for schools, colleges, and coaching institutes.",
    },
    primaryCtaLabel: {
      type: String,
      trim: true,
      default: "Start 14-day trial",
    },
    secondaryCtaLabel: {
      type: String,
      trim: true,
      default: "Request demo",
    },
  },
  contact: {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "sales@getpay.in",
    },
    phone: {
      type: String,
      trim: true,
      default: "+91 90000 00000",
    },
    address: {
      type: String,
      trim: true,
      default: "India",
    },
  },
  pricingPlans: {
    type: [pricingPlanSchema],
    default: () => ([
      {
        key: "starter",
        name: "Starter",
        priceInr: 4999,
        description: "For small schools and coaching centers starting online collections.",
        features: ["Up to 500 students", "Fee collection", "Receipts", "Basic reminders"],
        isVisible: true,
        isPopular: false,
        trialEnabled: true,
      },
      {
        key: "growth",
        name: "Growth",
        priceInr: 14999,
        description: "For institutions that need reporting, reminders, and stronger controls.",
        features: ["Up to 1,000 students", "Unlimited reminders", "Advanced reports", "Audit trail"],
        isVisible: true,
        isPopular: true,
        trialEnabled: true,
      },
      {
        key: "enterprise",
        name: "Enterprise",
        priceInr: 0,
        description: "For multi-branch institutions and custom operating needs.",
        features: ["Custom limits", "Priority support", "Advanced controls", "Custom onboarding"],
        isVisible: true,
        isPopular: false,
        trialEnabled: false,
      },
    ]),
  },
  faqs: [{
    question: {
      type: String,
      trim: true,
    },
    answer: {
      type: String,
      trim: true,
    },
  }],
}, { timestamps: true });

module.exports = mongoose.model("WebsiteContent", websiteContentSchema);
