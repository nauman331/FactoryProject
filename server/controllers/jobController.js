const Job = require('../models/Job');
const generateTaskId = require('../utils/generateTaskId');


const createJob = async (req, res) => {
  try {
    const { clientname } = req.body;
    const JobId = generateTaskId();

    const job = await Job.create({
      JobId,
      clientname,
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
    const { clientname  } = req.body;

    if (!clientname ) {
      return res.status(400).json({ message: 'Client Name is required to update' });
    }

    // Only update details
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { clientname },
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
    const jobs = await Job.find().populate("createdBy"); 
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
