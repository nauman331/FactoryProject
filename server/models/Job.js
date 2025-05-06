const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  JobId: { type: String, unique: true },
  clientname: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
