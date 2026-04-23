const express = require('express');
const router = express.Router();
const { getPublicResume } = require('../controllers/publicController');

router.get('/resume/:slug', getPublicResume);

module.exports = router;
