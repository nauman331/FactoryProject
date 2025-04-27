const express = require('express');
const router = express.Router();
const { createJob, getJobs, updateJob } = require('../controllers/jobController');
const protect = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const upload = require('../middleware/multer'); // <-- Add multer

// Multer setup to accept only 1 thumbnail image
const singleThumbnail = upload.single('thumbnail'); // This should match the field name in your form

// Route to create a job
router.post('/', protect, checkRole(['admin']), singleThumbnail, (req, res, next) => {
  if (req.file) {
    return createJob(req, res);
  } else {
    res.status(400).json({ message: 'Thumbnail image is required' });
  }
});

// Route to get all jobs
router.get('/', protect, getJobs);

// Route to update a job by ID
router.put('/:id', protect, checkRole(['admin']), singleThumbnail, (req, res, next) => {
  if (req.file) {
    return updateJob(req, res);
  } else {
    res.status(400).json({ message: 'Thumbnail image is required to update' });
  }
});

module.exports = router;
