const express = require('express');
const router = express.Router();
const {
  getResumes, getResume, createResume, updateResume, deleteResume,
  duplicateResume, toggleShare, getVersions, restoreVersion, saveVersion
} = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getResumes);
router.post('/', createResume);
router.get('/:id', getResume);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);
router.post('/:id/duplicate', duplicateResume);
router.post('/:id/share', toggleShare);
router.get('/:id/versions', getVersions);
router.post('/:id/versions', saveVersion);
router.post('/:id/versions/:versionId/restore', restoreVersion);

module.exports = router;
