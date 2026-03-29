const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'delayed', 'cancelled'],
    default: 'in_progress'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  location: String,
  weather: String,
  temperature: Number,
  workersPresent: Number,
  equipmentUsed: [String],
  media: [{
    url: String,
    type: {
      type: String,
      enum: ['image', 'video']
    },
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

trackingSchema.index({ project: 1, date: -1 });
trackingSchema.index({ project: 1, status: 1 });

module.exports = mongoose.model('Tracking', trackingSchema);