const express = require('express');
const router = express.Router();
const { createJob, getJobs } = require('../controllers/jobController');
const protect = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.post('/', protect, checkRole(['admin']), createJob);
router.get('/', protect, getJobs);

module.exports = router;
