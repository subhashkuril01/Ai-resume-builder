const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  key: { type: String, required: true },
  text: { type: String, required: true }
}, { _id: false });

const answerSchema = new mongoose.Schema({
  selectedOptionKey: String,
  answerText: String,
  timeSpentSeconds: { type: Number, default: 0 },
  savedAt: Date
}, { _id: false });

const evaluationSchema = new mongoose.Schema({
  score: { type: Number, default: 0 },
  isCorrect: { type: Boolean, default: false },
  explanation: String,
  strengths: [String],
  weaknesses: [String],
  correctApproach: String,
  missingConcepts: [String]
}, { _id: false });

const questionSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  type: {
    type: String,
    enum: ['mcq', 'scenario', 'practical', 'conceptual'],
    required: true
  },
  skill: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  prompt: { type: String, required: true },
  context: String,
  options: [optionSchema],
  correctAnswer: {
    optionKey: String,
    idealAnswer: String,
    expectedConcepts: [String],
    explanation: String
  },
  evaluationRubric: [String],
  estimatedMinutes: { type: Number, default: 5 },
  maxPoints: { type: Number, default: 10 },
  userAnswer: answerSchema,
  evaluation: evaluationSchema
}, { _id: false });

const skillBreakdownSchema = new mongoose.Schema({
  skill: String,
  score: Number,
  maxScore: Number,
  accuracy: Number,
  strengths: [String],
  weaknesses: [String]
}, { _id: false });

const mistakeSchema = new mongoose.Schema({
  questionId: String,
  skill: String,
  prompt: String,
  submittedAnswer: String,
  explanation: String,
  correctApproach: String
}, { _id: false });

const careerFeedbackSchema = new mongoose.Schema({
  resumeImprovements: [String],
  skillsToFocus: [String],
  learningRoadmap: [String],
  projectSuggestions: [String],
  interviewReadinessScore: Number,
  finalSummary: String
}, { _id: false });

const testReportSchema = new mongoose.Schema({
  overallScore: Number,
  accuracyLevel: Number,
  logicalThinkingScore: Number,
  problemSolvingAbility: Number,
  strengths: [String],
  weakAreas: [String],
  skillBreakdown: [skillBreakdownSchema],
  mistakeAnalysis: [mistakeSchema],
  careerFeedback: careerFeedbackSchema,
  comparison: {
    previousOverallScore: Number,
    delta: Number,
    improvedSkills: [String],
    declinedSkills: [String]
  }
}, { _id: false });

const resumeTestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
    index: true
  },
  resumeTitle: String,
  title: { type: String, required: true },
  attemptNumber: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'submitted', 'expired'],
    default: 'draft'
  },
  durationMinutes: { type: Number, default: 60 },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  generatedFrom: {
    skills: [String],
    projects: [String],
    technologies: [String]
  },
  questions: [questionSchema],
  report: testReportSchema,
  startedAt: Date,
  expiresAt: Date,
  submittedAt: Date,
  autoSubmitted: { type: Boolean, default: false }
}, { timestamps: true });

resumeTestSchema.index({ userId: 1, resumeId: 1, createdAt: -1 });

module.exports = mongoose.model('ResumeTest', resumeTestSchema);
