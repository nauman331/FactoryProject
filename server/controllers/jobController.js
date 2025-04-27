const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const Job = require('../models/Job'); // Make sure to import your Job model

const uploadToCloudinary = async (filePath, folder) => {
  try {
    const res = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
    });
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);  // Clean up after upload
    }
    return res.secure_url;
  } catch (err) {
    console.error('Error uploading to Cloudinary:', err);
    throw new Error('Cloudinary upload failed');
  }
};

const createJob = async (req, res) => {
  try {
    const { title } = req.body;
    let thumbnailUrl = null;

    if (req.file) {
      thumbnailUrl = await uploadToCloudinary(req.file.path, 'factory/jobs');
    }

    const job = await Job.create({
      title,
      thumbnail: thumbnailUrl,
      createdBy: req.user._id
    });

    res.status(201).json({ message: 'Job created successfully', job });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create job', error: err.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const { title } = req.body;
    let updateData = { title };

    if (req.file) {
      const thumbnailUrl = await uploadToCloudinary(req.file.path, 'factory/jobs');
      updateData.thumbnail = thumbnailUrl;
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedJob) return res.status(404).json({ message: 'Job not found' });

    res.json({ message: 'Job updated successfully', job: updatedJob });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update job', error: err.message });
  }
};

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve jobs', error: err.message });
  }
};

module.exports = {
  createJob,
  getJobs,
  updateJob,
};
