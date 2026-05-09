const express = require("express");
const router = express.Router();
const publicController = require("../controllers/publicController");
const rateLimit = require("../middleware/rateLimitMiddleware");

const trialSignupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyPrefix: "trial_signup"
});

const leadCaptureLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyPrefix: "public_lead"
});

router.get("/website-content", publicController.getWebsiteContent);
router.get("/legal/:slug", publicController.getLegalPage);

// Public registration (Self-service Trial)
router.post("/register-trial", trialSignupLimiter, publicController.registerTrial);
router.post("/leads", leadCaptureLimiter, publicController.captureLead);

module.exports = router;
