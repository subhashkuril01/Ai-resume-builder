const Resume = require('../models/Resume');
const AnalysisResult = require('../models/AnalysisResult');
const { asyncHandler } = require('../middleware/errorHandler');
const { getOpenAIClient, isMockMode, getMockAI } = require('../utils/openaiClient');


const resumeToText = (content) => {
  if (!content) return '';
  const parts = [];
  const { personalInfo, experience, skills, education, projects } = content;
  if (personalInfo?.summary) parts.push(`Summary: ${personalInfo.summary}`);
  if (experience?.length) {
    experience.forEach(e => {
      parts.push(`${e.position} at ${e.company}: ${e.description || ''}`);
      if (e.achievements?.length) parts.push(e.achievements.join('. '));
    });
  }
  if (skills) {
    const all = [...(skills.technical||[]), ...(skills.soft||[]), ...(skills.certifications||[])];
    if (all.length) parts.push(`Skills: ${all.join(', ')}`);
  }
  if (education?.length) {
    education.forEach(e => parts.push(`${e.degree} in ${e.field} from ${e.institution}`));
  }
  if (projects?.length) {
    projects.forEach(p => {
      parts.push(`Project: ${p.name} - ${p.description}`);
      if (p.technologies?.length) parts.push(`Tech: ${p.technologies.join(', ')}`);
    });
  }
  return parts.join('\n');
};

// @desc  Match resume against job description
// @route POST /api/job-match/analyze
const analyzeJobMatch = asyncHandler(async (req, res) => {
  const { resumeId, jobDescription } = req.body;

  if (!jobDescription?.trim()) {
    return res.status(400).json({ error: 'Job description is required.' });
  }

  const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found.' });
  }

  const resumeText = resumeToText(resume.content);

  let matchData;

  // Use mock AI or real OpenAI
  if (isMockMode()) {
    matchData = getMockAI().generateJobMatch(resumeText, jobDescription);
  } else {
    const openai = getOpenAIClient();
    const prompt = `You are a senior technical recruiter and career coach with expertise in talent matching.

Analyze how well this resume matches the job description and provide a detailed match report.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Respond ONLY with valid JSON (no markdown):
{
  "matchPercentage": <number 0-100>,
  "jobTitle": "Detected job title from description",
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["missing_skill1", "missing_skill2"],
  "missingExperience": ["experience gap 1", "experience gap 2"],
  "keywordAnalysis": {
    "present": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"]
  },
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "strengthsForRole": ["strength1", "strength2"],
  "overallAssessment": "2-3 sentence assessment of fit and main areas for improvement",
  "interviewTips": ["tip1", "tip2", "tip3"]
}

Scoring guide:
- 80-100: Strong match, apply immediately
- 60-79: Good match with some gaps
- 40-59: Moderate match, significant customization needed
- 0-39: Weak match`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    matchData = JSON.parse(response.choices[0].message.content);
  }

  // Save analysis result
  await AnalysisResult.create({
    resumeId: resume._id,
    userId: req.user.id,
    type: 'job_match',
    jobMatch: {
      matchPercentage: matchData.matchPercentage,
      matchedSkills: matchData.matchedSkills,
      missingSkills: matchData.missingSkills,
      recommendations: matchData.recommendations,
      jobTitle: matchData.jobTitle
    },
    overallFeedback: matchData.overallAssessment,
    jobDescription
  });

  res.json({ success: true, match: matchData });
});

// @desc  Extract keywords from job description
// @route POST /api/job-match/keywords
const extractKeywords = asyncHandler(async (req, res) => {
  const { jobDescription } = req.body;

  if (!jobDescription?.trim()) {
    return res.status(400).json({ error: 'Job description is required.' });
  }

  let keywords;

  // Use mock AI or real OpenAI
  if (isMockMode()) {
    keywords = getMockAI().generateKeywordExtraction(jobDescription);
  } else {
    const openai = getOpenAIClient();
    const prompt = `Extract the most important keywords and requirements from this job description for resume optimization.

JOB DESCRIPTION:
${jobDescription}

Respond ONLY with valid JSON:
{
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["skill1", "skill2"],
  "tools": ["tool1", "tool2"],
  "certifications": ["cert1"],
  "experience": ["requirement1", "requirement2"],
  "education": ["requirement1"],
  "keyPhrases": ["phrase1", "phrase2"],
  "jobLevel": "junior|mid|senior|lead|principal",
  "industry": "industry name"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    keywords = JSON.parse(response.choices[0].message.content);
  }

  res.json({ success: true, keywords });
});

module.exports = { analyzeJobMatch, extractKeywords };
