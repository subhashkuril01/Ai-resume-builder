const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  listTests,
  getTest,
  generateTest,
  startTest,
  saveAnswer,
  submitTest,
  retakeTest,
  updateTest,
  deleteTest
} = require('../controllers/resumeTestController');

router.use(protect);

router.get('/', listTests);
router.post('/generate', generateTest);
router.get('/:id', getTest);
router.post('/:id/start', startTest);
router.patch('/:id/answer', saveAnswer);
router.post('/:id/submit', submitTest);
router.post('/:id/retake', retakeTest);
router.put('/:id', updateTest);
router.delete('/:id', deleteTest);

module.exports = router;
