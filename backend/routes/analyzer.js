const express = require('express');
const router = express.Router();
const { analyzeATS, enhanceContent, getAnalysisHistory } = require('../controllers/analyzerController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/ats', analyzeATS);
router.post('/enhance', enhanceContent);
router.get('/history/:resumeId', getAnalysisHistory);

module.exports = router;
