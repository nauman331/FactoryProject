const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const Job = require('../models/Job');
const generateTaskId = require('../utils/generateTaskId');

const uploadToCloudinary = async (filePath, folder) => {
  try {
    const res = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
    });
    return res.secure_url;
  } catch (err) {
    console.error('Error uploading to Cloudinary:', err);
    throw new Error(`Cloudinary upload failed: ${err.message}`);
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Always clean up, success or failure
    }
  }
};

const createJob = async (req, res) => {
  try {
    const { details } = req.body;
    const JobId = generateTaskId();
    let thumbnailUrl = null;

    if (req.file) {
      thumbnailUrl = await uploadToCloudinary(req.file.path, 'factory/jobs');
    }

    const job = await Job.create({
      JobId,
      details,
      thumbnail: thumbnailUrl,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: 'Job created successfully', job });
  } catch (err) {
    console.error('Failed to create job:', err);
    res.status(500).json({ message: 'Failed to create job', error: err.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const { details } = req.body;

    if (!details) {
      return res.status(400).json({ message: 'details is required to update' });
    }

    // Only update details
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { details },
      { new: true, runValidators: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({ message: 'Job updated successfully', job: updatedJob });
  } catch (err) {
    console.error('Failed to update job:', err);
    res.status(500).json({ message: 'Failed to update job', error: err.message });
  }
};

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("createdBy"); // Corrected field
    res.json({ jobs });
  } catch (err) {
    console.error('Failed to retrieve jobs:', err);
    res.status(500).json({ message: 'Failed to retrieve jobs', error: err.message });
  }
};

module.exports = {
  createJob,
  getJobs,
  updateJob,
};
