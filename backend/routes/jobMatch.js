const express = require('express');
const router = express.Router();
const { analyzeJobMatch, extractKeywords } = require('../controllers/jobMatchController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/analyze', analyzeJobMatch);
router.post('/keywords', extractKeywords);

module.exports = router;
