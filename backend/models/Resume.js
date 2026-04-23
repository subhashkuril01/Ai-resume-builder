const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  field: String,
  startDate: String,
  endDate: String,
  gpa: String,
  achievements: [String]
}, { _id: true });

const experienceSchema = new mongoose.Schema({
  company: String,
  position: String,
  location: String,
  startDate: String,
  endDate: String,
  current: { type: Boolean, default: false },
  description: String,
  achievements: [String]
}, { _id: true });

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  technologies: [String],
  url: String,
  github: String,
  startDate: String,
  endDate: String
}, { _id: true });

const resumeContentSchema = new mongoose.Schema({
  personalInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    github: String,
    website: String,
    summary: String,
    profileImage: String
  },
  education: [educationSchema],
  experience: [experienceSchema],
  skills: {
    technical: [String],
    soft: [String],
    languages: [String],
    certifications: [String]
  },
  projects: [projectSchema],
  customSections: [{
    title: String,
    content: String
  }]
}, { _id: false });

const versionSchema = new mongoose.Schema({
  versionNumber: Number,
  label: String,
  content: resumeContentSchema,
  template: String,
  savedAt: { type: Date, default: Date.now }
}, { _id: true });

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Resume title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  template: {
    type: String,
    enum: ['modern', 'classic', 'minimal', 'executive', 'creative', 'tech'],
    default: 'modern'
  },
  content: resumeContentSchema,
  versions: [versionSchema],
  publicSlug: {
    type: String,
    unique: true,
    sparse: true,
    default: null
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  atsScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  sectionOrder: {
    type: [String],
    default: ['personalInfo', 'summary', 'experience', 'education', 'skills', 'projects']
  },
  lastAnalyzed: Date,
  autoSaveEnabled: { type: Boolean, default: true }
}, { timestamps: true });

// Generate public slug
resumeSchema.methods.generatePublicSlug = function() {
  this.publicSlug = uuidv4().replace(/-/g, '').substring(0, 12);
  this.isPublic = true;
  return this.publicSlug;
};

// Save version
resumeSchema.methods.saveVersion = function(label) {
  const versionNumber = (this.versions.length || 0) + 1;
  this.versions.push({
    versionNumber,
    label: label || `Version ${versionNumber}`,
    content: JSON.parse(JSON.stringify(this.content)),
    template: this.template,
    savedAt: new Date()
  });
  // Keep only last 10 versions
  if (this.versions.length > 10) {
    this.versions = this.versions.slice(-10);
  }
};

module.exports = mongoose.model('Resume', resumeSchema);
