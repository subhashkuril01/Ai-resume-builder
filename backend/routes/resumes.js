const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { protect } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeBase = path.basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-z0-9_-]/gi, '-').slice(0, 80) || 'resume';
    cb(null, `${Date.now()}-${safeBase}${path.extname(file.originalname).toLowerCase()}`);
  }
});

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/json',
  'image/png',
  'image/jpeg',
  'image/webp'
]);

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) return cb(null, true);
    cb(new Error('Unsupported file type. Upload PDF, DOC, DOCX, TXT, PNG, JPG, or WEBP.'));
  }
});

// ── Inline resume controller (was missing as a separate file) ──────────────
const Resume = require('../models/Resume');
const { asyncHandler } = require('../middleware/errorHandler');

const getResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ userId: req.user.id })
    .select('title template atsScore lastAnalyzed createdAt updatedAt isShared shareToken')
    .sort({ updatedAt: -1 });
  res.json({ success: true, resumes });
});

const getResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) return res.status(404).json({ error: 'Resume not found.' });
  res.json({ success: true, resume });
});

const createResume = asyncHandler(async (req, res) => {
  const { title, template, content } = req.body;
  const resume = await Resume.create({
    userId: req.user.id,
    title: title || 'Untitled Resume',
    template: template || 'modern',
    content: content || {}
  });
  res.status(201).json({ success: true, resume });
});

const updateResume = asyncHandler(async (req, res) => {
  const { title, template, content } = req.body;
  const resume = await Resume.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { title, template, content, updatedAt: new Date() },
    { new: true, runValidators: true }
  );
  if (!resume) return res.status(404).json({ error: 'Resume not found.' });
  res.json({ success: true, resume });
});

const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!resume) return res.status(404).json({ error: 'Resume not found.' });
  res.json({ success: true, message: 'Resume deleted successfully.' });
});

const duplicateResume = asyncHandler(async (req, res) => {
  const original = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!original) return res.status(404).json({ error: 'Resume not found.' });
  const copy = await Resume.create({
    userId: req.user.id,
    title: `${original.title} (Copy)`,
    template: original.template,
    content: original.content
  });
  res.status(201).json({ success: true, resume: copy });
});

const toggleShare = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) return res.status(404).json({ error: 'Resume not found.' });
  resume.isShared = !resume.isShared;
  if (resume.isShared && !resume.shareToken) {
    resume.shareToken = require('crypto').randomBytes(16).toString('hex');
  }
  await resume.save();
  res.json({ success: true, isShared: resume.isShared, shareToken: resume.shareToken });
});

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  const resume = await Resume.create({
    userId: req.user.id,
    title: req.file.originalname.replace(/\.[^/.]+$/, '') || 'Uploaded Resume',
    template: 'modern',
    content: {},
    uploadedFile: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    }
  });
  res.status(201).json({ success: true, resume });
});

// Version stubs — returns empty list; implement persistence later if needed
const getVersions = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) return res.status(404).json({ error: 'Resume not found.' });
  res.json({ success: true, versions: resume.versions || [] });
});

const saveVersion = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) return res.status(404).json({ error: 'Resume not found.' });
  const version = {
    versionId: require('crypto').randomBytes(8).toString('hex'),
    content: resume.content,
    savedAt: new Date(),
    label: req.body.label || `Version ${(resume.versions || []).length + 1}`
  };
  resume.versions = [...(resume.versions || []).slice(-9), version]; // keep last 10
  await resume.save();
  res.status(201).json({ success: true, version });
});

const restoreVersion = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) return res.status(404).json({ error: 'Resume not found.' });
  const version = (resume.versions || []).find(v => v.versionId === req.params.versionId);
  if (!version) return res.status(404).json({ error: 'Version not found.' });
  resume.content = version.content;
  resume.updatedAt = new Date();
  await resume.save();
  res.json({ success: true, resume });
});
// ─────────────────────────────────────────────────────────────────────────────

router.use(protect);

router.get('/', getResumes);
router.post('/', createResume);
router.post('/upload', upload.single('media'), uploadResume);
router.get('/:id', getResume);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);
router.post('/:id/duplicate', duplicateResume);
router.post('/:id/share', toggleShare);
router.get('/:id/versions', getVersions);
router.post('/:id/versions', saveVersion);
router.post('/:id/versions/:versionId/restore', restoreVersion);

module.exports = router;