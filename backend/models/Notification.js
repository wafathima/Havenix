const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['message', 'enquiry', 'enquiry_accepted', 'enquiry_rejected', 'project_update', 'milestone_update', 'purchase_request', 'purchase_accepted', 'purchase_rejected'], // Added purchase types
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    milestoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' }, // Added propertyId
    purchaseRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseRequest' }, // Added purchaseRequestId
    url: { type: String }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for faster queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);