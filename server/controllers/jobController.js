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

exports.createJob = async (req, res) => {
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

exports.updateJob = async (req, res) => {
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
