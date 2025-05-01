const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  JobId: { type: String, unique: true },
  clientname: { type: String },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }], // Reference to Tasks
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

jobSchema.methods.updateStatus = async function () {
  if (!this.tasks || this.tasks.length === 0) {
    this.status = 'pending';
    await this.save();
    return;
  }

  const tasks = await mongoose.model('Task').find({ '_id': { $in: this.tasks } });
  const allCompleted = tasks.every(task => task.status === 'completed');
  this.status = allCompleted ? 'completed' : 'pending';
  await this.save();
};


module.exports = mongoose.model('Job', jobSchema);
