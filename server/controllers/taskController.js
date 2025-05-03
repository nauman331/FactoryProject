const Task = require('../models/Task');
const Job = require('../models/Job');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

// Helper function to upload files to Cloudinary
const uploadToCloudinary = async (filePath, folder) => {
  const res = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'auto'
  });
  fs.unlinkSync(filePath); // Remove the file after upload
  return res.secure_url;
};

const checkAndUpdateJobStatus = async (jobId) => {
  const tasks = await Task.find({ job: jobId });
  const allCompleted = tasks.length > 0 && tasks.every(task => task.status === 'completed');
  await Job.findByIdAndUpdate(jobId, { status: allCompleted ? 'completed' : 'pending' });
};


// Create Task with client suggestions feature
const createTask = async (req, res) => {
  try {
    const { jobId, title, description, color, size, quantity, status, category } = req.body;

    const images = [];
    const documents = [];
    const voiceMessage = [];

    for (const file of req.files || []) {
      const uploadedUrl = await uploadToCloudinary(file.path, 'factory/tasks');
      if (file.mimetype.includes('image')) images.push(uploadedUrl);
      else if (file.mimetype.includes('pdf')) documents.push(uploadedUrl);
      else if (file.mimetype.includes('audio')) voiceMessage.push(uploadedUrl);
    }

    const task = await Task.create({
      title,
      job: jobId,
      description,
      color,
      size,
      status,
      quantity,
      images,
      documents,
      category,
      voiceMessage
    });

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Associated job not found' });
    }
    job.tasks.push(task._id);
    await checkAndUpdateJobStatus(jobId);

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
};

// Update Task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status, description, color, size, quantity, category  } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title, status, description, color, size, quantity, category  },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await checkAndUpdateJobStatus(updatedTask.job);

    res.json({ message: 'Task updated successfully', task: updatedTask });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
};


// Add a new voice message
const addVoiceMessage = async (req, res) => {
  try {
    const file = req.file;
    const taskId = req.params.id;
    const userId = req.user._id;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const uploadedUrl = await uploadToCloudinary(file.path, 'factory/tasks/voice');

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.voiceMessage.push({
      user: userId,
      url: uploadedUrl
    });
    await task.save();

    res.json({ message: 'Voice message added', task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add voice message', error: err.message });
  }
};

// Delete Task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Job.findByIdAndUpdate(task.job, { $pull: { tasks: id } });

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
};

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('job')
      .populate('voiceMessage.user', 'name')
      .exec();

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
};

// Get tasks by job ID
const getTasksByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;

    const tasks = await Task.find({ job: jobId })
      .populate('job')
      .populate('voiceMessage.user', 'name')
      .exec();

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found for this job' });
    }

    res.json({ message: 'Tasks fetched successfully', tasks });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks by job', error: err.message });
  }
};

// Get task by ID 
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate('job')
      .populate('voiceMessage.user', 'name')
      .exec();

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task fetched successfully', task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch task', error: err.message });
  }
};

module.exports = {
  createTask,
  updateTask,
  addVoiceMessage,
  deleteTask,
  getAllTasks,
  getTasksByJobId,
  getTaskById
};
