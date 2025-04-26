const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskId: { type: String, unique: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' },
  description: String,
  client: {
    name: String,
    contact: String
  },
  images: [String],       // Cloudinary URLs
  documents: [String],    // Cloudinary URLs
  voiceMessage: [String],    // Cloudinary URL
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
