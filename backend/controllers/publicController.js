const Resume = require('../models/Resume');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc  Get public resume by slug
// @route GET /api/public/resume/:slug
const getPublicResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({
    publicSlug: req.params.slug,
    isPublic: true
  }).select('-versions -userId -__v');

  if (!resume) {
    return res.status(404).json({ error: 'Resume not found or is not publicly shared.' });
  }

  res.json({ success: true, resume });
});

module.exports = { getPublicResume };
