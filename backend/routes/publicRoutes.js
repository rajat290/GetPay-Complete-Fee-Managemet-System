const express = require("express");
const router = express.Router();
const publicController = require("../controllers/publicController");
const rateLimit = require("../middleware/rateLimitMiddleware");

const trialSignupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyPrefix: "trial_signup"
});

// Public registration (Self-service Trial)
router.post("/register-trial", trialSignupLimiter, publicController.registerTrial);

module.exports = router;
