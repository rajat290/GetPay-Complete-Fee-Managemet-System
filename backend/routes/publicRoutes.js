const express = require("express");
const router = express.Router();
const publicController = require("../controllers/publicController");

// Public registration (Self-service Trial)
router.post("/register-trial", publicController.registerTrial);

module.exports = router;
