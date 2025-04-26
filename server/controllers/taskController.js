const Task = require('../models/Task');
const generateTaskId = require('../utils/generateTaskId');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

const uploadToCloudinary = async (filePath, folder) => {
  const res = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'auto'
  });
  fs.unlinkSync(filePath); // remove temp file
  return res.secure_url;
};

exports.createTask = async (req, res) => {
  try {
    const {
      jobId,
      assignedTo,
      status,
      description,
      clientName,
      clientContact
    } = req.body;

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
      status,
      description,
      client: { name: clientName, contact: clientContact },
      images,
      documents,
      voiceMessage
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task', error: err.message });
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
