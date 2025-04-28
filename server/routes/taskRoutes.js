const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const {
  createTask,
  updateTask,
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

// Routes
router.post('/', protect, checkRole(['admin', 'superadmin']), fileFields, createTask); // Create a new task
router.get('/', protect, getAllTasks); // Get all tasks
router.put('/:id', protect, checkRole(['admin', 'superadmin']), updateTask); // Update task details
router.post('/:id/voice', protect, voiceUpload, addVoiceMessage); // Add a voice message (chat-like feature)
router.delete('/:id', protect, checkRole(['admin', 'superadmin']), deleteTask); // Delete a task

module.exports = router;
