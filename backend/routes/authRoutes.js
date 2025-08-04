const express = require('express');
const { registerStudent, loginStudent, getProfile } = require('../controllers/authController');
const { protect} = require('../middleware/authMiddleware');

const router = express.Router();
router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.get('/profile', protect, getProfile);
module.exports = router;
// This code sets up the authentication routes for student registration, login, and profile retrieval. It uses Express Router to define the routes and their corresponding controller functions.
// The `protect` middleware is applied to the profile route to ensure that only authenticated users can access it. The `registerStudent`, `loginStudent`, and `getProfile` functions are imported from the `authController` module, which contains the logic for handling these requests.