const Job = require('../models/Job');
const generateTaskId = require('../utils/generateTaskId');


const createJob = async (req, res) => {
  try {
    const { clientname, category } = req.body;
    const JobId = await generateTaskId();

    const job = await Job.create({
      JobId,
      clientname,
      category,
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
    const { clientname, category  } = req.body;

    if (!clientname) {
      return res.status(400).json({ message: 'Client Name is required to update' });
    }
    if (!category) {
      return res.status(400).json({ message: 'Category is required to update' });
    }

    const updateFields = {};
    if (clientname) updateFields.clientname = clientname;
    if (category) updateFields.category = category;
    
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      updateFields,
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
    const jobs = await Job.find().populate("createdBy").populate("category"); 
    res.json({ jobs });
  } catch (err) {
    console.error('Failed to retrieve jobs:', err);
    res.status(500).json({ message: 'Failed to retrieve jobs', error: err.message });
  }
};

// controllers/jobController.js

const getClientSuggestions = async (req, res) => {
  try {
    const { search } = req.query;

    const regex = new RegExp(search, 'i'); // case-insensitive partial match
    const clients = await Job.find({ clientname: regex }).distinct('clientname');

    res.json({ clients });
  } catch (err) {
    console.error('Failed to fetch client suggestions:', err);
    res.status(500).json({ message: 'Failed to fetch suggestions' });
  }
};



module.exports = {
  createJob,
  getJobs,
  updateJob,
  getClientSuggestions,
};
