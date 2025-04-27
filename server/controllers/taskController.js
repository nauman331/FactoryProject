const Task = require('../models/Task');
const Job = require('../models/Job');
const generateTaskId = require('../utils/generateTaskId');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

const uploadToCloudinary = async (filePath, folder) => {
  const res = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'auto'
  });
  fs.unlinkSync(filePath);
  return res.secure_url;
};

exports.createTask = async (req, res) => {
  try {
    const { jobId, assignedTo, description, clientName, clientContact } = req.body;

    const taskId = generateTaskId();
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
      taskId,
      job: jobId,
      assignedTo,
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

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, status, description, clientName, clientContact } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        assignedTo,
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

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json({ message: 'Task status updated successfully', task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task status', error: err.message });
  }
};

exports.addVoiceMessage = async (req, res) => {
  try {
    const file = req.file;
    const taskId = req.params.id;

    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const uploadedUrl = await uploadToCloudinary(file.path, 'factory/tasks/voice');

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.voiceMessage.push(uploadedUrl);
    await task.save();

    res.json({ message: 'Voice message added', task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add voice message', error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
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

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('job').populate('assignedTo', 'name');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
};
