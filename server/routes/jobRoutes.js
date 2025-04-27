const express = require('express');
const router = express.Router();
const { createJob, getJobs, updateJob } = require('../controllers/jobController');
const protect = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const upload = require('../middleware/multer'); // <-- Add multer

const singleThumbnail = upload.single('thumbnail'); // Accept only 1 thumbnail image

router.post('/', protect, checkRole(['admin']), singleThumbnail, createJob);
router.get('/', protect, getJobs);
router.put('/:id', protect, checkRole(['admin']), singleThumbnail, updateJob);

module.exports = router;
