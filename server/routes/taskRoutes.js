const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const {
  createTask,
  updateTask,
  updateTaskStatus,
  addVoiceMessage,
  deleteTask,
  getAllTasks
} = require('../controllers/taskController');

const protect = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Upload multiple files
const fileFields = upload.array('files', 5);

// Upload single voice file
const voiceUpload = upload.single('voice');

router.post('/', protect, checkRole(['admin']), fileFields, createTask);
router.get('/', protect, getAllTasks);
router.put('/:id', protect, checkRole(['admin']), updateTask);
router.patch('/:id/status', protect, checkRole(['admin', 'member']), updateTaskStatus);
router.post('/:id/voice', protect, checkRole(['admin', 'member']), voiceUpload, addVoiceMessage);
router.delete('/:id', protect, checkRole(['admin']), deleteTask);

module.exports = router;
