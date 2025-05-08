const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const {
  createTask,
  updateTask,
  addVoiceMessage,
  addTextMessage,
  deleteTask,
  getAllTasks,
  getTasksByJobId,
  getTaskById,
  filterByCategory
} = require('../controllers/taskController');

const protect = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Upload multiple files (image/pdf/audio) for task creation
const fileFields = upload.array('files');

// Upload single voice message for chat
const voiceUpload = upload.single('voice');

// Routes
router.post('/', protect, checkRole(['admin', 'superadmin']), fileFields, createTask);         // Create a new task
router.get('/', protect, getAllTasks);                                                         // Get all tasks
router.get('/job/:jobId', protect, getTasksByJobId);                                           // Get tasks by job ID
router.get('/category/:categoryId', protect, filterByCategory);                                // Filter tasks by category
router.get('/:id', protect, getTaskById);                                                      // Get task by ID
router.put('/:id', protect, fileFields, updateTask);                                                       // Update a task
router.post('/:id/voice', protect, voiceUpload, addVoiceMessage);                              // Add voice message to task
router.post('/:id/text', protect, addTextMessage);                                             // Add text message to task
router.delete('/:id', protect, checkRole(['admin', 'superadmin']), deleteTask);                // Delete a task

module.exports = router;
