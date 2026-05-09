const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const {
  getResumes, getResume, createResume, updateResume, deleteResume,
  uploadResume, duplicateResume, toggleShare, getVersions, restoreVersion, saveVersion
} = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeBase = path.basename(file.originalname, path.extname(file.originalname)).replace(/[^a-z0-9_-]/gi, '-').slice(0, 80) || 'resume';
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
