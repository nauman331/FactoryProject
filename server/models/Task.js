const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  color: { type: String },
  size: { type: String },
  quantity: { type: String },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  status: { 
    type: String, 
    enum: [
      'pending',
      'mockup-development', 
      'pattern-development', 
      'material-sourcing',
      'printing',
      'embossing',
      'dye-making', 
      'rough-sample',
      'cutting',
      'stitching',
      'completed'
    ], 
    default: 'pending' 
  },
  description: String,
  images: [String], // Cloudinary URLs
  documents: [String], // Cloudinary URLs
  voiceMessage: [{ // Array of voice messages for chat-like feature
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    url: String,
    timestamp: { type: Date, default: Date.now }
  }],
  history: [{ // Track changes over time
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now },
    previousState: {
      title: String,
      description: String,
      color: String,
      size: String,
      quantity: String,
      status: String,
      category: mongoose.Schema.Types.ObjectId
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
