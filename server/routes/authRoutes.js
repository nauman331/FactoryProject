const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);  // Only superadmin should use this from the panel
router.post('/login', login);

module.exports = router;
