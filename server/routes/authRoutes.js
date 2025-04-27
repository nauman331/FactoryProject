const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.post('/register', protect, checkRole(['superadmin']), register);  // Only superadmin should use this from the panel
router.post('/login', login);

module.exports = router;
