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
  this.status = this.tasks.length > 0 ? 'completed' : 'pending';
  await this.save();
};

module.exports = mongoose.model('Job', jobSchema);
