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

// Create Task with client suggestions feature
const createTask = async (req, res) => {
  try {
    const { jobId, title, description, clientName, clientContact } = req.body;

    // Prepare file uploads for Cloudinary
    const images = [];
    const documents = [];
    const voiceMessage = [];

    for (const file of req.files || []) {
      const uploadedUrl = await uploadToCloudinary(file.path, 'factory/tasks');
      if (file.mimetype.includes('image')) images.push(uploadedUrl);
      else if (file.mimetype.includes('pdf')) documents.push(uploadedUrl);
      else if (file.mimetype.includes('audio')) voiceMessage.push(uploadedUrl);
    }

    // Create task
    const task = await Task.create({
      title,
      job: jobId,
      description,
      client: { name: clientName, contact: clientContact },
      images,
      documents,
      voiceMessage
    });

    // Link task to job
    const job = await Job.findById(jobId);
    job.tasks.push(task._id);
    await job.updateStatus();

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
};

// Update Task (no assignedTo)
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status, description, clientName, clientContact } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        title,
        status,
        description,
        client: { name: clientName, contact: clientContact },
      },
      { new: true, runValidators: true }
    );

    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });

    res.json({ message: 'Task updated successfully', task: updatedTask });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
};

// Add a new voice message as part of chat feature
const addVoiceMessage = async (req, res) => {
  try {
    const file = req.file;
    const taskId = req.params.id;
    const userId = req.user._id;  // Assuming user info is attached to request

    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const uploadedUrl = await uploadToCloudinary(file.path, 'factory/tasks/voice');

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Add the voice message with user reference
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
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Remove task reference from Job
    await Job.findByIdAndUpdate(task.job, { $pull: { tasks: id } });

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
};

// Get All Tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('job')
      .populate('voiceMessage.user', 'name') // Populate user data for voice messages
      .exec();

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
};

module.exports = {
  createTask,
  updateTask,
  addVoiceMessage,
  deleteTask,
  getAllTasks
};
