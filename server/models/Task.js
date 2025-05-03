const mongoose = require('mongoose');
const Job = require('./Job');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  color: { type: String },
  size: { type: String },
  quantity: { type: String },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  description: String,
  images: [String],
  documents: [String],
  voiceMessage: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    url: String,
    timestamp: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

// Handle .save()
taskSchema.post('save', async function (doc) {
  if (!doc.job) return;

  const Task = mongoose.model('Task');
  const Job = mongoose.model('Job');

  const allTasks = await Task.find({ job: doc.job });
  const allCompleted = allTasks.every(task => task.status === 'completed');

  if (allCompleted) {
    await Job.findByIdAndUpdate(doc.job, { status: 'completed' });
  } else {
    await Job.findByIdAndUpdate(doc.job, { status: 'pending' });
  }
});

// Handle findByIdAndUpdate / findOneAndUpdate
taskSchema.post('findOneAndUpdate', async function (doc) {
  if (!doc || !doc.job) return;

  const Task = mongoose.model('Task');
  const Job = mongoose.model('Job');

  const allTasks = await Task.find({ job: doc.job });
  const allCompleted = allTasks.every(task => task.status === 'completed');

  if (allCompleted) {
    await Job.findByIdAndUpdate(doc.job, { status: 'completed' });
  } else {
    await Job.findByIdAndUpdate(doc.job, { status: 'pending' });
  }
});

module.exports = mongoose.model('Task', taskSchema);
