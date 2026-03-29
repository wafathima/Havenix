const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  dueDate: Date,
  completedDate: Date,
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'delayed', 'cancelled'],
    default: 'pending'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  media: [{
    url: String,
    type: String,
    filename: String
  }],
  trackingEntries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tracking'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

milestoneSchema.index({ project: 1, status: 1 });
milestoneSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Milestone', milestoneSchema);