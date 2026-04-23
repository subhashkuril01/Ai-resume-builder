const mongoose = require('mongoose');

const analysisResultSchema = new mongoose.Schema({
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['ats_analysis', 'job_match', 'content_enhancement'],
    required: true
  },
  atsScore: { type: Number, min: 0, max: 100 },
  keywords: {
    found: [String],
    missing: [String],
    recommended: [String]
  },
  sections: {
    strong: [String],
    weak: [String],
    missing: [String]
  },
  suggestions: [{
    category: String,
    priority: { type: String, enum: ['high', 'medium', 'low'] },
    issue: String,
    suggestion: String
  }],
  jobMatch: {
    matchPercentage: Number,
    matchedSkills: [String],
    missingSkills: [String],
    recommendations: [String],
    jobTitle: String
  },
  overallFeedback: String,
  jobDescription: String,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AnalysisResult', analysisResultSchema);
