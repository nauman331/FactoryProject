const Job = require('../models/Job');

exports.createJob = async (req, res) => {
  try {
    const { title } = req.body;
    const job = await Job.create({
      title,
      createdBy: req.user._id
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create job', error: err.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('createdBy', 'name role');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch jobs', error: err.message });
  }
};
