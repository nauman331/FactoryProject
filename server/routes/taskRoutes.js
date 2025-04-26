const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const {
  createTask,
  updateTaskStatus,
  getAllTasks
} = require('../controllers/taskController');

const protect = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Upload fields: multiple files allowed
const fileFields = upload.array('files', 5);

router.post('/', protect, checkRole(['admin']), fileFields, createTask);
router.patch('/:id/status', protect, checkRole(['admin', 'member']), updateTaskStatus);
router.get('/', protect, getAllTasks);

module.exports = router;
