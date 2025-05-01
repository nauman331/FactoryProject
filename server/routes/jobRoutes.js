const express = require('express');
const router = express.Router();
const { createJob, getJobs, updateJob } = require('../controllers/jobController');
const protect = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');


// Route to create a job
router.post('/', protect, checkRole(['admin', 'superadmin']), createJob);

// Route to get all jobs
router.get('/', protect, getJobs);

// Route to update a job by ID
router.put('/:id', protect, checkRole(['admin', 'superadmin']), updateJob);

module.exports = router;
