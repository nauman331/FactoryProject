const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  JobId: { type: String, unique: true },
  clientname: { type: String },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }], // Reference to Tasks
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-update status based on tasks
jobSchema.methods.updateStatus = async function () {
  const tasks = await mongoose.model('Task').find({ '_id': { $in: this.tasks } });

  // Check if all tasks are completed
  const allCompleted = tasks.every(task => task.status === 'completed');

  // Set the job status to completed if all tasks are completed, otherwise set to pending
  this.status = allCompleted ? 'completed' : 'pending';
  await this.save();
};

module.exports = mongoose.model('Job', jobSchema);
