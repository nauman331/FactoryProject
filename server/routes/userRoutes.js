const express = require('express');
const router = express.Router();
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.get('/', protect, checkRole(['superadmin']), async (req, res) => {
  const users = await User.find({ role: { $ne: 'superadmin' } }).select('-password');
  res.json(users);
});

router.delete('/:id', protect, checkRole(['superadmin']), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

module.exports = router;
