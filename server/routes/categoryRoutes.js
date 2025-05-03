const express = require('express');
const router = express.Router();
const {
addCategory,
getCategories,
deleteCategory
} = require('../controllers/categoryController');

const protect = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');


// Routes
router.post('/', protect, checkRole(['superadmin']), addCategory);         // Create a new task
router.get('/', protect, getCategories);                                                        // Get all tasks                                        // Get tasks by job ID                            // Add voice message to task
router.delete('/:id', protect, checkRole(['superadmin']), deleteCategory);               // Delete a task

module.exports = router;
