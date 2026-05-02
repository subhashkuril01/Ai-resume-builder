const mongoose = require('mongoose');

const adminUsageLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  requestType: {
    type: String,
    enum: ['analyzer', 'job-match', 'resume-test', 'other'],
    required: true
  },
  tokensUsed: {
    type: Number,
    default: 0
  },
  costEstimate: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'quota-exceeded'],
    default: 'success'
  },
  metadata: {
    endpoint: String,
    method: String,
    responseTime: Number
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: false });

// Index for efficient querying
adminUsageLogSchema.index({ userId: 1, createdAt: -1 });
adminUsageLogSchema.index({ requestType: 1, createdAt: -1 });

module.exports = mongoose.model('AdminUsageLog', adminUsageLogSchema);
