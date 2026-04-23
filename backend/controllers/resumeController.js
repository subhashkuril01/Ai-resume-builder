const Resume = require('../models/Resume');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc  Get all resumes for user
// @route GET /api/resumes
const getResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ userId: req.user.id })
    .select('title template atsScore isPublic publicSlug createdAt updatedAt sectionOrder')
    .sort({ updatedAt: -1 });
  res.json({ success: true, count: resumes.length, resumes });
});

// @desc  Get single resume
// @route GET /api/resumes/:id
const getResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found.' });
  }
  res.json({ success: true, resume });
});

// @desc  Create resume
// @route POST /api/resumes
const createResume = asyncHandler(async (req, res) => {
  const { title, template, content, sectionOrder } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Resume title is required.' });
  }

  const resume = await Resume.create({
    userId: req.user.id,
    title,
    template: template || 'modern',
    content: content || {},
    sectionOrder: sectionOrder || ['personalInfo', 'summary', 'experience', 'education', 'skills', 'projects']
  });

  // Add to user's resumes array
  await User.findByIdAndUpdate(req.user.id, { $push: { resumes: resume._id } });

  res.status(201).json({ success: true, resume });
});

// @desc  Update resume
// @route PUT /api/resumes/:id
const updateResume = asyncHandler(async (req, res) => {
  const { title, template, content, sectionOrder, autoSave } = req.body;

  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found.' });
  }

  // Auto-save version before major changes (not on every keystroke)
  if (!autoSave && content) {
    resume.saveVersion(`Auto-save ${new Date().toLocaleDateString()}`);
  }

  if (title !== undefined) resume.title = title;
  if (template !== undefined) resume.template = template;
  if (content !== undefined) resume.content = content;
  if (sectionOrder !== undefined) resume.sectionOrder = sectionOrder;

  await resume.save();
  res.json({ success: true, resume });
});

// @desc  Delete resume
// @route DELETE /api/resumes/:id
const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found.' });
  }

  await resume.deleteOne();
  await User.findByIdAndUpdate(req.user.id, { $pull: { resumes: resume._id } });

  res.json({ success: true, message: 'Resume deleted successfully.' });
});

// @desc  Duplicate resume
// @route POST /api/resumes/:id/duplicate
const duplicateResume = asyncHandler(async (req, res) => {
  const original = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!original) {
    return res.status(404).json({ error: 'Resume not found.' });
  }

  const duplicate = await Resume.create({
    userId: req.user.id,
    title: `${original.title} (Copy)`,
    template: original.template,
    content: JSON.parse(JSON.stringify(original.content)),
    sectionOrder: original.sectionOrder
  });

  await User.findByIdAndUpdate(req.user.id, { $push: { resumes: duplicate._id } });
  res.status(201).json({ success: true, resume: duplicate });
});

// @desc  Toggle public sharing
// @route POST /api/resumes/:id/share
const toggleShare = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found.' });
  }

  if (resume.isPublic) {
    resume.isPublic = false;
    resume.publicSlug = null;
  } else {
    resume.generatePublicSlug();
  }

  await resume.save();
  res.json({
    success: true,
    isPublic: resume.isPublic,
    publicSlug: resume.publicSlug,
    shareUrl: resume.isPublic ? `${process.env.FRONTEND_URL}/r/${resume.publicSlug}` : null
  });
});

// @desc  Get resume versions
// @route GET /api/resumes/:id/versions
const getVersions = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id }).select('versions title');
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found.' });
  }
  res.json({ success: true, versions: resume.versions.reverse() });
});

// @desc  Restore version
// @route POST /api/resumes/:id/versions/:versionId/restore
const restoreVersion = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found.' });
  }

  const version = resume.versions.id(req.params.versionId);
  if (!version) {
    return res.status(404).json({ error: 'Version not found.' });
  }

  // Save current state as a version before restoring
  resume.saveVersion('Before restore');

  resume.content = JSON.parse(JSON.stringify(version.content));
  resume.template = version.template;
  await resume.save();

  res.json({ success: true, resume, message: `Restored to ${version.label}` });
});

// @desc  Save manual version
// @route POST /api/resumes/:id/versions
const saveVersion = asyncHandler(async (req, res) => {
  const { label } = req.body;
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found.' });
  }

  resume.saveVersion(label);
  await resume.save();

  res.json({ success: true, message: 'Version saved.', versions: resume.versions });
});

module.exports = {
  getResumes, getResume, createResume, updateResume, deleteResume,
  duplicateResume, toggleShare, getVersions, restoreVersion, saveVersion
};
