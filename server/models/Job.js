const mongoose = require('mongoose');
const Task = require('./Task'); // Ensure Task model is imported

const jobSchema = new mongoose.Schema({
  JobId: { type: String, unique: true },
  clientname: { type: String },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }], // Reference to Tasks
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

jobSchema.methods.updateStatus = async function () {
  // Ensure the job has tasks
  if (!this.tasks || this.tasks.length === 0) {
    this.status = 'pending'; // If no tasks, set to 'pending'
    await this.save();
    return;
  }

  // Populate tasks to get their latest status
  const tasks = await Task.find({ '_id': { $in: this.tasks } });

  // Check if all tasks are completed
  const allCompleted = tasks.every(task => task.status === 'completed');
  
  // Update the job status based on task statuses
  this.status = allCompleted ? 'completed' : 'pending';
  await this.save();
};

module.exports = mongoose.model('Job', jobSchema);
