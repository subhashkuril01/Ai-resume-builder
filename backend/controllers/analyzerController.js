const Resume = require('../models/Resume');
const AnalysisResult = require('../models/AnalysisResult');
const { asyncHandler } = require('../middleware/errorHandler');
const { getOpenAIClient, isMockMode, getMockAI } = require('../utils/openaiClient');


// Convert resume content to readable text for AI analysis
const resumeToText = (content) => {
  if (!content) return '';
  const parts = [];
  const { personalInfo, education, experience, skills, projects } = content;

  if (personalInfo) {
    parts.push(`NAME: ${personalInfo.firstName} ${personalInfo.lastName}`);
    parts.push(`CONTACT: ${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}`);
    if (personalInfo.summary) parts.push(`SUMMARY: ${personalInfo.summary}`);
  }

  if (experience?.length) {
    parts.push('\nEXPERIENCE:');
    experience.forEach(exp => {
      parts.push(`- ${exp.position} at ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})`);
      if (exp.description) parts.push(`  ${exp.description}`);
      if (exp.achievements?.length) parts.push(`  Achievements: ${exp.achievements.join(', ')}`);
    });
  }

  if (education?.length) {
    parts.push('\nEDUCATION:');
    education.forEach(edu => {
      parts.push(`- ${edu.degree} in ${edu.field} from ${edu.institution} (${edu.startDate} - ${edu.endDate})`);
    });
  }

  if (skills) {
    const allSkills = [
      ...(skills.technical || []),
      ...(skills.soft || []),
      ...(skills.languages || []),
      ...(skills.certifications || [])
    ];
    if (allSkills.length) parts.push(`\nSKILLS: ${allSkills.join(', ')}`);
  }

  if (projects?.length) {
    parts.push('\nPROJECTS:');
    projects.forEach(proj => {
      parts.push(`- ${proj.name}: ${proj.description}`);
      if (proj.technologies?.length) parts.push(`  Tech: ${proj.technologies.join(', ')}`);
    });
  }

  return parts.join('\n');
};

// @desc  Analyze resume for ATS score
// @route POST /api/analyzer/ats
const analyzeATS = asyncHandler(async (req, res) => {
  const { resumeId } = req.body;

  const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found.' });
  }

  const resumeText = resumeToText(resume.content);

  if (!resumeText.trim()) {
    return res.status(400).json({ error: 'Resume content is empty. Please add content before analyzing.' });
  }

  let analysisData;

  // Use mock AI or real OpenAI
  if (isMockMode()) {
    analysisData = getMockAI().generateATSAnalysis(resumeText);
  } else {
    const openai = getOpenAIClient();
    const prompt = `You are an expert ATS (Applicant Tracking System) resume analyzer with deep knowledge of modern hiring practices.

Analyze this resume and provide a detailed ATS compatibility report:

RESUME:
${resumeText}

Respond ONLY with valid JSON in this exact structure (no markdown, no explanation):
{
  "atsScore": <number 0-100>,
  "keywords": {
    "found": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"],
    "recommended": ["keyword5", "keyword6"]
  },
  "sections": {
    "strong": ["section_name"],
    "weak": ["section_name"],
    "missing": ["section_name"]
  },
  "suggestions": [
    {
      "category": "contact_info|summary|experience|skills|education|formatting|keywords",
      "priority": "high|medium|low",
      "issue": "Brief description of the issue",
      "suggestion": "Specific actionable fix"
    }
  ],
  "overallFeedback": "2-3 sentence executive summary of resume strength and top priority improvements"
}

Scoring criteria:
- Contact info completeness (10pts)
- Professional summary quality (15pts)
- Experience with measurable achievements (25pts)
- Skills section relevance and breadth (20pts)
- Education completeness (10pts)
- Keywords and ATS compatibility (20pts)`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    analysisData = JSON.parse(response.choices[0].message.content);
  }

  // Save analysis result
  const analysisResult = await AnalysisResult.create({
    resumeId: resume._id,
    userId: req.user.id,
    type: 'ats_analysis',
    atsScore: analysisData.atsScore,
    keywords: analysisData.keywords,
    sections: analysisData.sections,
    suggestions: analysisData.suggestions,
    overallFeedback: analysisData.overallFeedback
  });

  // Update resume ATS score
  resume.atsScore = analysisData.atsScore;
  resume.lastAnalyzed = new Date();
  await resume.save();

  res.json({ success: true, analysis: analysisData, analysisId: analysisResult._id });
});

// @desc  Enhance resume content with AI
// @route POST /api/analyzer/enhance
const enhanceContent = asyncHandler(async (req, res) => {
  const { text, type, context } = req.body;

  if (!text || !type) {
    return res.status(400).json({ error: 'Text and type are required.' });
  }

  let result;

  // Use mock AI or real OpenAI
  if (isMockMode()) {
    result = getMockAI().generateEnhancedContent(text, type);
  } else {
    const openai = getOpenAIClient();
    const typePrompts = {
      summary: 'professional resume summary/objective statement',
      experience_description: 'job experience bullet points with quantifiable achievements',
      achievement: 'achievement bullet point with metrics and impact',
      project_description: 'technical project description for a resume',
      skills: 'professional skills list'
    };

    const prompt = `You are an expert resume writer with 15+ years of experience helping candidates land top-tier jobs.

Enhance this ${typePrompts[type] || 'resume content'} to be more professional, impactful, and ATS-optimized.
${context ? `Context: ${context}` : ''}

ORIGINAL TEXT:
${text}

Respond ONLY with valid JSON:
{
  "enhanced": "The enhanced version of the text",
  "improvements": ["improvement made 1", "improvement made 2", "improvement made 3"],
  "keywords_added": ["keyword1", "keyword2"]
}

Rules:
- Use strong action verbs
- Quantify achievements where possible (use reasonable estimates if not given)
- Keep professional tone
- Optimize for ATS systems
- Be concise but impactful
- Do not invent false information, only enhance what's provided`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    result = JSON.parse(response.choices[0].message.content);
  }

  res.json({ success: true, ...result });
});

// @desc  Get analysis history
// @route GET /api/analyzer/history/:resumeId
const getAnalysisHistory = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.resumeId, userId: req.user.id });
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found.' });
  }

  const history = await AnalysisResult.find({ resumeId: req.params.resumeId, userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({ success: true, history });
});

module.exports = { analyzeATS, enhanceContent, getAnalysisHistory };
