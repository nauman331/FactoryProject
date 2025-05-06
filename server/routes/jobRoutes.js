const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  updateJob,
  getClientSuggestions,
  getJobsByCategory
} = require('../controllers/jobController');

const protect = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Route to create a job
router.post('/', protect, checkRole(['admin', 'superadmin']), createJob);

// Route to get all jobs
router.get('/', protect, getJobs);

// Route to get job suggestions by client name
router.get('/suggestions', protect, checkRole(['admin', 'superadmin']), getClientSuggestions);

// Route to get jobs by category
router.get('/category/:category', protect, getJobsByCategory);

// Route to update a job by ID
router.put('/:id', protect, checkRole(['admin', 'superadmin']), updateJob);

module.exports = router;
